"use client";

import React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Copy,
  MapPin,
  Clock,
  User,
  Lock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  BarChart3,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ViewMode = "time" | "location";
type TimeStatus = "impossible" | "maybe" | "available";
type SelectionMode = "available" | "maybe";

interface TimeSlot {
  day: number;
  hour: number;
  status: TimeStatus;
}

interface ParticipantData {
  name: string;
  timeSlots: TimeSlot[];
  locationVotes: string[];
}

interface LocationOption {
  id: string;
  name: string;
  votes: string[]; // 투표한 사람들의 이름
}

export default function EventCreated() {
  const [roomName] = useState("팀 회의 일정 조율");
  const [viewMode, setViewMode] = useState<ViewMode>("time");
  const [selectionMode, setSelectionMode] =
    useState<SelectionMode>("available");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ name: "", password: "" });
  // useState 부분에서 timeSlots 초기화를 2주일로 변경
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(() => {
    const slots: TimeSlot[] = [];
    // 14일 (2주), 9시-18시 (9시간)
    for (let day = 0; day < 14; day++) {
      for (let hour = 9; hour < 18; hour++) {
        slots.push({
          day,
          hour,
          status: "impossible",
        });
      }
    }
    return slots;
  });

  // 전체 보기 모달 상태 추가
  const [showFullCalendar, setShowFullCalendar] = useState(false);

  // 장소 관련 상태
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([
    { id: "1", name: "강남역 스타벅스", votes: ["김철수", "이영희"] },
    { id: "2", name: "홍대 카페거리", votes: ["박민수"] },
    { id: "3", name: "신촌 맛집", votes: ["김철수", "정수진"] },
  ]);
  const [newLocationName, setNewLocationName] = useState("");
  const [userLocationVotes, setUserLocationVotes] = useState<string[]>([]);

  // 가상의 참가자 데이터 (통계용)
  // 참가자 데이터도 14일로 확장
  const [participants] = useState<ParticipantData[]>([
    {
      name: "김철수",
      locationVotes: ["강남역 스타벅스", "신촌 맛집"],
      timeSlots: (() => {
        const slots: TimeSlot[] = [];
        for (let day = 0; day < 14; day++) {
          for (let hour = 9; hour < 18; hour++) {
            const random = Math.random();
            let status: TimeStatus = "impossible";
            if (random > 0.7) status = "available";
            else if (random > 0.4) status = "maybe";
            slots.push({ day, hour, status });
          }
        }
        return slots;
      })(),
    },
    {
      name: "이영희",
      locationVotes: ["강남역 스타벅스"],
      timeSlots: (() => {
        const slots: TimeSlot[] = [];
        for (let day = 0; day < 14; day++) {
          for (let hour = 9; hour < 18; hour++) {
            const random = Math.random();
            let status: TimeStatus = "impossible";
            if (random > 0.6) status = "available";
            else if (random > 0.3) status = "maybe";
            slots.push({ day, hour, status });
          }
        }
        return slots;
      })(),
    },
    {
      name: "박민수",
      locationVotes: ["홍대 카페거리"],
      timeSlots: (() => {
        const slots: TimeSlot[] = [];
        for (let day = 0; day < 14; day++) {
          for (let hour = 9; hour < 18; hour++) {
            const random = Math.random();
            let status: TimeStatus = "impossible";
            if (random > 0.5) status = "available";
            else if (random > 0.2) status = "maybe";
            slots.push({ day, hour, status });
          }
        }
        return slots;
      })(),
    },
    {
      name: "정수진",
      locationVotes: ["신촌 맛집"],
      timeSlots: (() => {
        const slots: TimeSlot[] = [];
        for (let day = 0; day < 14; day++) {
          for (let hour = 9; hour < 18; hour++) {
            const random = Math.random();
            let status: TimeStatus = "impossible";
            if (random > 0.8) status = "available";
            else if (random > 0.5) status = "maybe";
            slots.push({ day, hour, status });
          }
        }
        return slots;
      })(),
    },
  ]);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{
    day: number;
    hour: number;
  } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // days 배열을 2주일로 확장
  const days = ["월", "화", "수", "목", "금", "토", "일"];
  const fullDays = Array.from({ length: 14 }, (_, i) => {
    const dayIndex = i % 7;
    const weekNumber = Math.floor(i / 7) + 1;
    return `${days[dayIndex]} (${weekNumber}주차)`;
  });
  const hours = Array.from({ length: 9 }, (_, i) => i + 9); // 9시부터 17시까지

  const copyRoomName = async () => {
    try {
      await navigator.clipboard.writeText(roomName);
      // 복사 완료 피드백을 여기에 추가할 수 있습니다
    } catch (err) {
      console.error("복사 실패:", err);
    }
  };

  const handleLogin = () => {
    if (loginForm.name.trim()) {
      setIsLoggedIn(true);
      setLoginModalOpen(false);
      setLoginForm({ name: "", password: "" });
    }
  };

  // getSlotIndex 함수 수정
  const getSlotIndex = (day: number, hour: number) => {
    return day * 9 + (hour - 9);
  };

  const getNextStatus = (
    currentStatus: TimeStatus,
    mode: SelectionMode
  ): TimeStatus => {
    if (mode === "available") {
      return currentStatus === "available" ? "impossible" : "available";
    } else {
      return currentStatus === "maybe" ? "impossible" : "maybe";
    }
  };

  const handleMouseDown = (day: number, hour: number) => {
    if (!isLoggedIn) {
      setLoginModalOpen(true);
      return;
    }

    setIsDragging(true);
    setDragStart({ day, hour });

    // 시작 슬롯 상태 변경
    const slotIndex = getSlotIndex(day, hour);
    const newSlots = [...timeSlots];
    newSlots[slotIndex].status = getNextStatus(
      newSlots[slotIndex].status,
      selectionMode
    );
    setTimeSlots(newSlots);
  };

  const handleMouseEnter = (day: number, hour: number) => {
    if (!isDragging || !dragStart || !isLoggedIn) return;

    const newSlots = [...timeSlots];

    // 드래그 영역 계산
    const minDay = Math.min(dragStart.day, day);
    const maxDay = Math.max(dragStart.day, day);
    const minHour = Math.min(dragStart.hour, hour);
    const maxHour = Math.max(dragStart.hour, hour);

    // 드래그 시작점의 새로운 상태 확인
    const startSlotIndex = getSlotIndex(dragStart.day, dragStart.hour);
    const targetStatus = newSlots[startSlotIndex].status;

    // 드래그 영역의 모든 슬롯을 같은 상태로 설정
    for (let d = 0; d < 14; d++) {
      for (let h = 9; h < 18; h++) {
        const slotIndex = getSlotIndex(d, h);
        if (d >= minDay && d <= maxDay && h >= minHour && h <= maxHour) {
          newSlots[slotIndex].status = targetStatus;
        }
      }
    }

    setTimeSlots(newSlots);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const getSlotColor = (status: TimeStatus) => {
    switch (status) {
      case "impossible":
        return "bg-red-200 hover:bg-red-300 border-red-300";
      case "maybe":
        return "bg-amber-200 hover:bg-amber-300 border-amber-300";
      case "available":
        return "bg-emerald-200 hover:bg-emerald-300 border-emerald-300";
    }
  };

  const getStatusCount = (status: TimeStatus) => {
    return timeSlots.filter((slot) => slot.status === status).length;
  };

  // 통계용 함수들
  // 통계 함수들도 14일로 수정
  const getAvailabilityCount = (day: number, hour: number) => {
    return participants.reduce((count, participant) => {
      const slot = participant.timeSlots.find(
        (s) => s.day === day && s.hour === hour
      );
      return count + (slot?.status === "available" ? 1 : 0);
    }, 0);
  };

  const getMaybeCount = (day: number, hour: number) => {
    return participants.reduce((count, participant) => {
      const slot = participant.timeSlots.find(
        (s) => s.day === day && s.hour === hour
      );
      return count + (slot?.status === "maybe" ? 1 : 0);
    }, 0);
  };

  const getStatisticsSlotColor = (day: number, hour: number) => {
    const availableCount = getAvailabilityCount(day, hour);
    const maybeCount = getMaybeCount(day, hour);
    const totalParticipants = participants.length;

    // 가능한 사람 수에 따라 초록색 채도 조절
    if (availableCount === 0) {
      if (maybeCount > 0) {
        const intensity = Math.min(maybeCount / totalParticipants, 1);
        return `bg-amber-${Math.ceil(intensity * 400) + 100} border-amber-300`;
      }
      return "bg-slate-100 border-slate-200";
    }

    const intensity = availableCount / totalParticipants;
    if (intensity >= 0.8) return "bg-emerald-600 border-emerald-700";
    if (intensity >= 0.6) return "bg-emerald-500 border-emerald-600";
    if (intensity >= 0.4) return "bg-emerald-400 border-emerald-500";
    if (intensity >= 0.2) return "bg-emerald-300 border-emerald-400";
    return "bg-emerald-200 border-emerald-300";
  };

  // 장소 관련 함수들
  const addLocationOption = () => {
    if (!newLocationName.trim() || !isLoggedIn) return;

    const newOption: LocationOption = {
      id: Date.now().toString(),
      name: newLocationName.trim(),
      votes: [loginForm.name], // 추가한 사람이 자동으로 투표
    };

    setLocationOptions([...locationOptions, newOption]);
    setUserLocationVotes([...userLocationVotes, newLocationName.trim()]);
    setNewLocationName("");
  };

  const toggleLocationVote = (locationName: string) => {
    if (!isLoggedIn) {
      setLoginModalOpen(true);
      return;
    }

    const userName = loginForm.name;
    setLocationOptions((prev) =>
      prev.map((option) => {
        if (option.name === locationName) {
          const hasVoted = option.votes.includes(userName);
          return {
            ...option,
            votes: hasVoted
              ? option.votes.filter((name) => name !== userName)
              : [...option.votes, userName],
          };
        }
        return option;
      })
    );

    setUserLocationVotes((prev) =>
      prev.includes(locationName)
        ? prev.filter((name) => name !== locationName)
        : [...prev, locationName]
    );
  };

  const getViewModeIcon = (mode: ViewMode) => {
    switch (mode) {
      case "time":
        return <Clock className="w-4 h-4" />;
      case "location":
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getViewModeText = (mode: ViewMode) => {
    switch (mode) {
      case "time":
        return "시간";
      case "location":
        return "공간";
    }
  };

  // 특정 시간대의 참가자 상태 조회 함수
  const getParticipantsByStatus = (day: number, hour: number) => {
    const available: string[] = [];
    const maybe: string[] = [];

    participants.forEach((participant) => {
      const slot = participant.timeSlots.find(
        (s) => s.day === day && s.hour === hour
      );
      if (slot?.status === "available") {
        available.push(participant.name);
      } else if (slot?.status === "maybe") {
        maybe.push(participant.name);
      }
    });

    return { available, maybe };
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <Input
                    value={roomName}
                    readOnly
                    className="text-lg font-semibold border-2 border-slate-300 bg-white min-w-[300px]"
                  />
                  <Button
                    onClick={copyRoomName}
                    variant="outline"
                    className="px-4 py-2 border-2 border-slate-300 hover:bg-slate-100 bg-transparent"
                  >
                    복사
                    <Copy className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>

              <Dialog open={loginModalOpen} onOpenChange={setLoginModalOpen}>
                {isLoggedIn && (
                  <div className="px-6 py-2 border-2 border-slate-300 bg-slate-50 rounded-md text-slate-600">
                    {loginForm.name || "사용자"}님
                  </div>
                )}
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      로그인
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">이름 *</Label>
                      <Input
                        id="name"
                        placeholder="이름을 입력하세요"
                        value={loginForm.name}
                        onChange={(e) =>
                          setLoginForm({ ...loginForm, name: e.target.value })
                        }
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="password"
                        className="flex items-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        비밀번호 (선택)
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="비밀번호 (선택사항)"
                        value={loginForm.password}
                        onChange={(e) =>
                          setLoginForm({
                            ...loginForm,
                            password: e.target.value,
                          })
                        }
                        className="h-11"
                      />
                    </div>
                    <Button
                      onClick={handleLogin}
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                      disabled={!loginForm.name.trim()}
                    >
                      로그인
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* View Mode Toggle */}
            <div className="flex justify-start mb-8">
              <div className="bg-blue-600 rounded-full p-1 flex items-center shadow-lg">
                {(["time", "location"] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                      viewMode === mode
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-white hover:bg-blue-500"
                    }`}
                  >
                    {getViewModeIcon(mode)}
                    {getViewModeText(mode)}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Left Panel */}
              <Card className="border-0 shadow-xl bg-white">
                <CardContent className="p-6">
                  {viewMode === "time" ? (
                    <>
                      {/* Selection Mode Toggle */}
                      {isLoggedIn && (
                        <div className="mb-6 flex justify-center">
                          <div className="bg-slate-100 rounded-lg p-1 flex items-center">
                            <button
                              onClick={() => setSelectionMode("available")}
                              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                                selectionMode === "available"
                                  ? "bg-emerald-500 text-white shadow-sm"
                                  : "text-slate-600 hover:text-slate-800"
                              }`}
                            >
                              <CheckCircle className="w-4 h-4" />
                              가능한 시간 선택
                            </button>
                            <button
                              onClick={() => setSelectionMode("maybe")}
                              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                                selectionMode === "maybe"
                                  ? "bg-amber-500 text-white shadow-sm"
                                  : "text-slate-600 hover:text-slate-800"
                              }`}
                            >
                              <AlertCircle className="w-4 h-4" />
                              애매한 시간 선택
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 전체 보기 버튼 추가 */}
                      <div className="mb-4 flex justify-between items-center">
                        <div className="text-center text-slate-600 text-sm flex-1">
                          {isLoggedIn
                            ? `${
                                selectionMode === "available"
                                  ? "가능한"
                                  : "애매한"
                              } 시간을 드래그해서 선택하세요`
                            : "로그인 후 시간을 선택할 수 있습니다"}
                        </div>
                        <Button
                          onClick={() => setShowFullCalendar(true)}
                          variant="outline"
                          className="ml-4 border-blue-500 text-blue-600 hover:bg-blue-50"
                        >
                          전체 보기
                        </Button>
                      </div>

                      <div
                        ref={gridRef}
                        className={`select-none relative ${
                          !isLoggedIn ? "opacity-50" : ""
                        }`}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                      >
                        {/* Login Overlay */}
                        {!isLoggedIn && (
                          <div className="absolute inset-0 bg-slate-100/80 backdrop-blur-sm flex items-center justify-center z-10 pointer-events-none">
                            <div className="text-center space-y-4">
                              <div className="text-black text-lg font-medium z-20">
                                로그인 후 시간을 선택할 수 있습니다
                              </div>
                              <Button
                                onClick={() => setLoginModalOpen(true)}
                                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 font-medium shadow-md pointer-events-auto"
                              >
                                <User className="w-4 h-4 mr-2" />
                                로그인하기
                              </Button>
                            </div>
                          </div>
                        )}
                        {/* Time Grid */}
                        {/* 기존 시간표를 1주차만 보여주도록 수정 (첫 7일만) */}
                        <div className="grid grid-cols-8 gap-1">
                          {/* Header - Empty cell for time column */}
                          <div className="h-12 flex items-center justify-center font-semibold text-slate-600 text-sm">
                            시간
                          </div>

                          {/* Day Headers - 1주차만 */}
                          {days.map((day, index) => (
                            <div
                              key={day}
                              className="h-12 flex items-center justify-center font-semibold text-slate-600 text-sm"
                            >
                              {day}
                            </div>
                          ))}

                          {/* Time Slots - 1주차만 */}
                          {hours.map((hour) => (
                            <React.Fragment key={hour}>
                              {/* Time Label */}
                              <div className="h-12 flex items-center justify-center text-sm text-slate-600 font-medium">
                                {hour}:00
                              </div>

                              {/* Day Slots for this hour - 첫 7일만 */}
                              {Array.from({ length: 7 }, (_, dayIndex) => {
                                const slotIndex = getSlotIndex(dayIndex, hour);
                                const slot = timeSlots[slotIndex];

                                return (
                                  <div
                                    key={`${dayIndex}-${hour}`}
                                    className={`h-12 border transition-all duration-150 ${
                                      isLoggedIn
                                        ? "cursor-pointer"
                                        : "cursor-not-allowed"
                                    } ${getSlotColor(slot.status)}`}
                                    onMouseDown={() =>
                                      handleMouseDown(dayIndex, hour)
                                    }
                                    onMouseEnter={() =>
                                      handleMouseEnter(dayIndex, hour)
                                    }
                                  />
                                );
                              })}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Location Voting */
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          장소 투표
                        </h3>
                      </div>

                      {/* Add New Location */}
                      {isLoggedIn && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex gap-3">
                            <Input
                              value={newLocationName}
                              onChange={(e) =>
                                setNewLocationName(e.target.value)
                              }
                              placeholder="새로운 장소를 추가하세요"
                              className="flex-1 h-11"
                              onKeyPress={(e) =>
                                e.key === "Enter" && addLocationOption()
                              }
                            />
                            <Button
                              onClick={addLocationOption}
                              className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-4"
                              disabled={!newLocationName.trim()}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Location Options */}
                      <div className="space-y-3">
                        {locationOptions.map((option) => {
                          const isVoted =
                            isLoggedIn && option.votes.includes(loginForm.name);
                          const voteCount = option.votes.length;

                          return (
                            <div
                              key={option.id}
                              className={`p-4 border rounded-lg transition-all cursor-pointer ${
                                isVoted
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              } ${
                                !isLoggedIn
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                              onClick={() => toggleLocationVote(option.name)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                      isVoted
                                        ? "border-blue-500 bg-blue-500"
                                        : "border-slate-300"
                                    }`}
                                  >
                                    {isVoted && (
                                      <CheckCircle className="w-3 h-3 text-white" />
                                    )}
                                  </div>
                                  <span className="font-medium text-slate-800">
                                    {option.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-slate-600">
                                    {voteCount}표
                                  </span>
                                  <div className="flex -space-x-1">
                                    {option.votes
                                      .slice(0, 3)
                                      .map((voterName, index) => (
                                        <div
                                          key={index}
                                          className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-medium border-2 border-white"
                                          title={voterName}
                                        >
                                          {voterName.charAt(0)}
                                        </div>
                                      ))}
                                    {option.votes.length > 3 && (
                                      <div className="w-6 h-6 bg-slate-400 rounded-full flex items-center justify-center text-xs text-white font-medium border-2 border-white">
                                        +{option.votes.length - 3}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Right Panel - Statistics */}
              <Card className="border-0 shadow-xl bg-white">
                <CardContent className="p-6">
                  {viewMode === "time" ? (
                    /* Time Statistics */
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-blue-600" />
                          시간 통계
                        </h3>

                        <TooltipProvider>
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-blue-50"
                              >
                                <User className="w-4 h-4 text-blue-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent
                              side="left"
                              className="max-w-xs bg-slate-900 text-white z-50"
                            >
                              <div className="space-y-2">
                                <div className="font-medium">
                                  참가자 ({participants.length}명)
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {participants.map((participant, index) => (
                                    <span
                                      key={index}
                                      className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                                    >
                                      {participant.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      {/* Best Time Recommendation - 통계 그리드 위로 이동 */}
                      <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                        <h4 className="font-medium text-emerald-800 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          추천 시간대 Top 3 (가장 많은 사람이 가능한 시간)
                        </h4>
                        {(() => {
                          // 모든 시간대의 가능한 사람 수 계산
                          const timeSlotCounts: {
                            dayIndex: number;
                            hour: number;
                            count: number;
                            dayName: string;
                            weekNumber: number;
                          }[] = [];
                          for (let dayIndex = 0; dayIndex < 14; dayIndex++) {
                            for (let hour = 9; hour < 18; hour++) {
                              const count = getAvailabilityCount(
                                dayIndex,
                                hour
                              );
                              if (count > 0) {
                                const dayName = days[dayIndex % 7];
                                const weekNumber = Math.floor(dayIndex / 7) + 1;
                                timeSlotCounts.push({
                                  dayIndex,
                                  hour,
                                  count,
                                  dayName,
                                  weekNumber,
                                });
                              }
                            }
                          }

                          // 가능한 사람 수로 정렬하고 Top 3 선택
                          const top3 = timeSlotCounts
                            .sort((a, b) => b.count - a.count)
                            .slice(0, 3);

                          return (
                            <div className="grid grid-cols-3 gap-3">
                              {top3.map((slot, index) => (
                                <div
                                  key={`${slot.dayIndex}-${slot.hour}`}
                                  className="p-3 bg-white rounded-lg border border-emerald-200 text-center"
                                >
                                  <div className="flex items-center justify-center w-6 h-6 bg-emerald-600 text-white rounded-full text-xs font-bold mx-auto mb-2">
                                    {index + 1}
                                  </div>
                                  <div className="font-medium text-emerald-700 mb-1 text-sm">
                                    {slot.dayName} ({slot.weekNumber}주차)
                                  </div>
                                  <div className="text-emerald-600 font-medium text-sm">
                                    {slot.hour}:00
                                  </div>
                                  <div className="text-xs text-emerald-500">
                                    {slot.count}명 가능
                                  </div>
                                </div>
                              ))}
                              {top3.length === 0 && (
                                <div className="col-span-3 text-center text-slate-400 py-4">
                                  아직 가능한 시간이 없습니다
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Statistics Grid */}
                      <div className="space-y-4">
                        <div className="text-sm text-slate-600">
                          색상이 진할수록 더 많은 사람이 가능한 시간입니다
                        </div>

                        <div className="grid grid-cols-8 gap-1">
                          {/* Header */}
                          <div className="h-10 flex items-center justify-center font-semibold text-slate-600 text-xs">
                            시간
                          </div>
                          {days.map((day) => (
                            <div
                              key={day}
                              className="h-10 flex items-center justify-center font-semibold text-slate-600 text-xs text-center"
                            >
                              {day}
                            </div>
                          ))}

                          {/* Statistics Slots */}
                          {hours.map((hour) => (
                            <React.Fragment key={hour}>
                              <div className="h-10 flex items-center justify-center text-xs text-slate-600 font-medium">
                                {hour}:00
                              </div>
                              {days.map((_, dayIndex) => {
                                const availableCount = getAvailabilityCount(
                                  dayIndex,
                                  hour
                                );
                                const maybeCount = getMaybeCount(
                                  dayIndex,
                                  hour
                                );
                                const participantsByStatus =
                                  getParticipantsByStatus(dayIndex, hour);

                                return (
                                  <TooltipProvider
                                    key={`stats-${dayIndex}-${hour}`}
                                  >
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div
                                          className={`h-10 border transition-all duration-150 cursor-default ${getStatisticsSlotColor(
                                            dayIndex,
                                            hour
                                          )}`}
                                        />
                                      </TooltipTrigger>
                                      <TooltipContent
                                        side="top"
                                        className="max-w-xs bg-slate-900 text-white p-3"
                                      >
                                        <div className="space-y-2">
                                          <div className="font-medium text-sm">
                                            {days[dayIndex]} {hour}:00
                                          </div>
                                          {participantsByStatus.available
                                            .length > 0 && (
                                            <div>
                                              <div className="flex items-center gap-1 text-emerald-400 text-xs mb-1">
                                                <CheckCircle className="w-3 h-3" />
                                                가능한 사람 (
                                                {
                                                  participantsByStatus.available
                                                    .length
                                                }
                                                명)
                                              </div>
                                              <div className="flex flex-wrap gap-1">
                                                {participantsByStatus.available.map(
                                                  (name, idx) => (
                                                    <span
                                                      key={idx}
                                                      className="bg-emerald-600 text-white px-2 py-1 rounded text-xs"
                                                    >
                                                      {name}
                                                    </span>
                                                  )
                                                )}
                                              </div>
                                            </div>
                                          )}
                                          {participantsByStatus.maybe.length >
                                            0 && (
                                            <div>
                                              <div className="flex items-center gap-1 text-amber-400 text-xs mb-1">
                                                <AlertCircle className="w-3 h-3" />
                                                애매한 사람 (
                                                {
                                                  participantsByStatus.maybe
                                                    .length
                                                }
                                                명)
                                              </div>
                                              <div className="flex flex-wrap gap-1">
                                                {participantsByStatus.maybe.map(
                                                  (name, idx) => (
                                                    <span
                                                      key={idx}
                                                      className="bg-amber-600 text-white px-2 py-1 rounded text-xs"
                                                    >
                                                      {name}
                                                    </span>
                                                  )
                                                )}
                                              </div>
                                            </div>
                                          )}
                                          {participantsByStatus.available
                                            .length === 0 &&
                                            participantsByStatus.maybe
                                              .length === 0 && (
                                              <div className="text-slate-400 text-xs">
                                                아직 응답한 사람이 없습니다
                                              </div>
                                            )}
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                );
                              })}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Location Statistics */
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        참가자별 장소 통계
                      </h3>

                      {/* Participants Info */}
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-800">
                            참가자 ({participants.length}명)
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {participants.map((participant, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                            >
                              {participant.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Best Location Recommendation - 통계 그리드 위로 이동 */}
                      <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                        <h4 className="font-medium text-emerald-800 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          추천 장소 Top 3 (가장 많은 사람이 투표한 장소)
                        </h4>
                        {(() => {
                          // 모든 장소의 투표 수 계산
                          const locationCounts = locationOptions.map(
                            (option) => ({
                              name: option.name,
                              count: option.votes.length,
                            })
                          );

                          // 투표 수로 정렬하고 Top 3 선택
                          const top3 = locationCounts
                            .sort((a, b) => b.count - a.count)
                            .slice(0, 3);

                          return (
                            <div className="grid grid-cols-3 gap-3">
                              {top3.map((location, index) => (
                                <div
                                  key={location.name}
                                  className="p-3 bg-white rounded-lg border border-emerald-200 text-center"
                                >
                                  <div className="flex items-center justify-center w-6 h-6 bg-emerald-600 text-white rounded-full text-xs font-bold mx-auto mb-2">
                                    {index + 1}
                                  </div>
                                  <div className="font-medium text-emerald-700 mb-1 text-sm">
                                    {location.name}
                                  </div>
                                  <div className="text-emerald-600 font-medium text-sm">
                                    {location.count}표
                                  </div>
                                </div>
                              ))}
                              {top3.length === 0 && (
                                <div className="col-span-3 text-center text-slate-400 py-4">
                                  아직 투표한 장소가 없습니다
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Statistics Grid */}
                      <div className="space-y-4">
                        <div className="text-sm text-slate-600">
                          색상이 진할수록 더 많은 사람이 투표한 장소입니다
                        </div>

                        <div className="grid grid-cols-8 gap-1">
                          {/* Header */}
                          <div className="h-10 flex items-center justify-center font-semibold text-slate-600 text-xs">
                            장소
                          </div>
                          {locationOptions.map((option) => (
                            <div
                              key={option.id}
                              className="h-10 flex items-center justify-center font-semibold text-slate-600 text-xs text-center"
                            >
                              {option.name}
                            </div>
                          ))}

                          {/* Statistics Slots */}
                          {participants.map((participant) => (
                            <React.Fragment key={participant.name}>
                              <div className="h-10 flex items-center justify-center text-xs text-slate-600 font-medium">
                                {participant.name}
                              </div>
                              {locationOptions.map((option) => {
                                const hasVoted =
                                  participant.locationVotes.includes(
                                    option.name
                                  );

                                return (
                                  <div
                                    key={`${participant.name}-${option.name}`}
                                    className={`h-10 border transition-all duration-150 ${
                                      hasVoted
                                        ? "bg-emerald-500 text-white"
                                        : "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    {/* 숫자 표시 제거 */}
                                  </div>
                                );
                              })}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      {/* Full Calendar Modal */}
      <Dialog open={showFullCalendar} onOpenChange={setShowFullCalendar}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              2주 전체 시간표
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Selection Mode Toggle */}
            {isLoggedIn && (
              <div className="flex justify-center">
                <div className="bg-slate-100 rounded-lg p-1 flex items-center">
                  <button
                    onClick={() => setSelectionMode("available")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                      selectionMode === "available"
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-800"
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    가능한 시간 선택
                  </button>
                  <button
                    onClick={() => setSelectionMode("maybe")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                      selectionMode === "maybe"
                        ? "bg-amber-500 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-800"
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    애매한 시간 선택
                  </button>
                </div>
              </div>
            )}

            {/* Full Time Grid */}
            <div
              className={`select-none ${
                !isLoggedIn ? "opacity-50 pointer-events-none" : ""
              }`}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div className="grid grid-cols-[auto_repeat(14,1fr)] gap-1">
                {/* Header - Empty cell for time column */}
                <div className="h-12 flex items-center justify-center font-semibold text-slate-600 text-sm">
                  시간
                </div>

                {/* Day Headers - 2주 전체 */}
                {fullDays.map((day, index) => (
                  <div
                    key={day}
                    className="h-12 flex items-center justify-center font-semibold text-slate-600 text-sm text-center"
                  >
                    {day}
                  </div>
                ))}

                {/* Time Slots - 2주 전체 */}
                {hours.map((hour) => (
                  <React.Fragment key={hour}>
                    {/* Time Label */}
                    <div className="h-12 flex items-center justify-center text-sm text-slate-600 font-medium">
                      {hour}:00
                    </div>

                    {/* Day Slots for this hour - 2주 전체 */}
                    {Array.from({ length: 14 }, (_, dayIndex) => {
                      const slotIndex = getSlotIndex(dayIndex, hour);
                      const slot = timeSlots[slotIndex];

                      return (
                        <div
                          key={`${dayIndex}-${hour}`}
                          className={`h-12 border transition-all duration-150 ${
                            isLoggedIn ? "cursor-pointer" : "cursor-not-allowed"
                          } ${getSlotColor(slot.status)}`}
                          onMouseDown={() => handleMouseDown(dayIndex, hour)}
                          onMouseEnter={() => handleMouseEnter(dayIndex, hour)}
                        />
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

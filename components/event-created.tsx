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
  const sevenDays = fullDays.slice(0, 7);
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
      case "available":
        return `bg-primary`;
      case "maybe":
        return `bg-primary/50`;
      default:
        return "bg-muted";
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
    const availabilityCount = getAvailabilityCount(day, hour);
    const maybeCount = getMaybeCount(day, hour);
    const totalParticipants = participants.length;
    const opacity = (availabilityCount + maybeCount * 0.5) / totalParticipants;

    if (availabilityCount > 0) {
      return `bg-primary/` + opacity * 100;
    }
    return `bg-primary/` + opacity * 100;
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <header className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-4xl font-extrabold tracking-tight text-primary">
                {roomName}
              </h1>
              <Button variant="outline" className="hidden sm:flex">
                <Copy className="mr-2 h-4 w-4" />
                링크 복사
              </Button>
            </div>
            <div className="flex items-center space-x-6 text-muted-foreground">
              <div className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                <span>30분</span>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                <span>장소 투표</span>
              </div>
              <div className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                <span>{participants.length}명 참여중</span>
              </div>
              <div className="flex items-center text-destructive">
                <Lock className="mr-2 h-5 w-5" />
                <span>비공개</span>
              </div>
            </div>
          </header>

          <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <Card className="w-full border-0 shadow-2xl shadow-primary/10 bg-card">
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {isLoggedIn
                          ? `안녕하세요, ${loginForm.name}님!`
                          : "내 시간 등록하기"}
                      </h2>
                      <p className="text-muted-foreground mt-1">
                        {isLoggedIn
                          ? "가능한 시간을 드래그하여 선택하세요."
                          : "먼저 내 정보를 입력하고 시작하세요."}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={viewMode === "time" ? "default" : "outline"}
                        onClick={() => setViewMode("time")}
                        className="rounded-full h-11 w-11 p-0"
                      >
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Clock className="h-5 w-5" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>시간</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Button>
                      <Button
                        variant={
                          viewMode === "location" ? "default" : "outline"
                        }
                        onClick={() => setViewMode("location")}
                        className="rounded-full h-11 w-11 p-0"
                      >
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <MapPin className="h-5 w-5" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>장소</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Button>
                    </div>
                  </div>

                  {viewMode === "time" ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => setSelectionMode("available")}
                            className={`h-10 px-4 rounded-lg text-sm font-semibold transition-all ${
                              selectionMode === "available"
                                ? "bg-primary text-primary-foreground shadow-md"
                                : "bg-transparent text-muted-foreground hover:bg-background/50"
                            }`}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            가능
                          </Button>
                          <Button
                            onClick={() => setSelectionMode("maybe")}
                            className={`h-10 px-4 rounded-lg text-sm font-semibold transition-all ${
                              selectionMode === "maybe"
                                ? "bg-primary/60 text-primary-foreground shadow-md"
                                : "bg-transparent text-muted-foreground hover:bg-background/50"
                            }`}
                          >
                            <AlertCircle className="mr-2 h-4 w-4" />
                            조정 가능
                          </Button>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-sm bg-primary" />
                            <span className="font-medium text-foreground">
                              가능 ({getStatusCount("available")})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-sm bg-primary/50" />
                            <span className="font-medium text-foreground">
                              조정 가능 ({getStatusCount("maybe")})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        className="grid gap-px bg-border select-none border border-border"
                        ref={gridRef}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        style={{
                          gridTemplateColumns: `60px repeat(${sevenDays.length}, 1fr)`,
                        }}
                      >
                        {/* 시간 헤더 */}
                        <div className="bg-card"></div>
                        {sevenDays.map((day, dayIndex) => (
                          <div
                            key={dayIndex}
                            className="text-center py-3 text-sm font-semibold bg-card text-muted-foreground"
                          >
                            {day.split(" ")[0]}
                            <br />
                            <span className="text-xs font-normal">
                              (7/{dayIndex + 10})
                            </span>
                          </div>
                        ))}

                        {/* 시간대별 그리드 */}
                        {hours.map((hour) => (
                          <React.Fragment key={hour}>
                            <div className="flex items-center justify-center text-xs font-semibold bg-card text-muted-foreground">
                              {hour}:00
                            </div>
                            {sevenDays.map((_, dayIndex) => {
                              const slotIndex = getSlotIndex(dayIndex, hour);
                              const slot = timeSlots[slotIndex];
                              return (
                                <div
                                  key={`${dayIndex}-${hour}`}
                                  className={`h-10 transition-colors ${getSlotColor(
                                    slot.status
                                  )} ${
                                    isLoggedIn
                                      ? "cursor-pointer hover:opacity-80"
                                      : "cursor-not-allowed"
                                  }`}
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

                      <div className="text-center">
                        <Button
                          variant="secondary"
                          onClick={() => setShowFullCalendar(true)}
                        >
                          2주 전체 시간표 보기
                        </Button>
                      </div>

                      {!isLoggedIn && (
                        <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-muted/50 border-2 border-dashed border-primary/20">
                          <div className="text-center">
                            <p className="text-lg font-bold text-foreground mb-2">
                              로그인하고 내 일정을 등록하세요
                            </p>
                            <p className="text-muted-foreground mb-6">
                              이름과 (선택적으로) 비밀번호를 입력하여 내 응답을
                              저장하고 나중에 수정할 수 있습니다.
                            </p>
                            <Dialog
                              open={loginModalOpen}
                              onOpenChange={setLoginModalOpen}
                            >
                              <DialogTrigger asChild>
                                <Button size="lg" className="h-12 text-lg">
                                  <User className="mr-2 h-5 w-5" />
                                  정보 입력하기
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px] bg-card">
                                <DialogHeader>
                                  <DialogTitle className="text-foreground">
                                    내 정보 입력
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                      htmlFor="name"
                                      className="text-right text-muted-foreground"
                                    >
                                      이름
                                    </Label>
                                    <Input
                                      id="name"
                                      value={loginForm.name}
                                      onChange={(e) =>
                                        setLoginForm({
                                          ...loginForm,
                                          name: e.target.value,
                                        })
                                      }
                                      className="col-span-3 bg-background"
                                      placeholder="실명을 입력하세요"
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                      htmlFor="password"
                                      className="text-right text-muted-foreground"
                                    >
                                      비밀번호
                                    </Label>
                                    <Input
                                      id="password"
                                      type="password"
                                      value={loginForm.password}
                                      onChange={(e) =>
                                        setLoginForm({
                                          ...loginForm,
                                          password: e.target.value,
                                        })
                                      }
                                      className="col-span-3 bg-background"
                                      placeholder="(선택) 수정 시 필요"
                                    />
                                  </div>
                                </div>
                                <Button
                                  onClick={handleLogin}
                                  className="w-full"
                                >
                                  저장하고 계속하기
                                </Button>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="p-4 bg-muted rounded-xl">
                        <h3 className="font-bold text-foreground mb-3">
                          가고 싶은 장소에 투표하세요 (다중 선택 가능)
                        </h3>
                        <div className="space-y-3">
                          {locationOptions.map((option) => (
                            <div
                              key={option.id}
                              onClick={() => toggleLocationVote(option.name)}
                              className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all border ${
                                userLocationVotes.includes(option.name)
                                  ? "bg-primary/10 border-primary"
                                  : "bg-background hover:bg-muted"
                              }`}
                            >
                              <div className="flex items-center">
                                <div className="font-semibold text-foreground mr-4">
                                  {option.name}
                                </div>
                                <div className="flex -space-x-2">
                                  {option.votes.slice(0, 3).map((voter, i) => (
                                    <TooltipProvider key={i}>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-sm font-bold text-muted-foreground">
                                            {voter.charAt(0)}
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>{voter}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  ))}
                                  {option.votes.length > 3 && (
                                    <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-sm font-bold text-muted-foreground">
                                      +{option.votes.length - 3}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-primary font-bold">
                                {userLocationVotes.includes(option.name) && (
                                  <CheckCircle className="w-5 h-5" />
                                )}
                                {option.votes.length}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Input
                          value={newLocationName}
                          onChange={(e) => setNewLocationName(e.target.value)}
                          placeholder="새로운 장소 제안하기"
                          className="flex-1"
                        />
                        <Button onClick={addLocationOption}>
                          <Plus className="mr-2 h-4 w-4" />
                          추가
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-2xl shadow-primary/10 bg-card">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-foreground mb-6">
                    전체 통계
                  </h3>

                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-xl">
                      <h4 className="font-bold text-foreground mb-3">
                        추천 시간대 Top 3
                      </h4>
                      {(() => {
                        const timeSlotCounts: {
                          day: number;
                          hour: number;
                          count: number;
                        }[] = [];
                        for (let day = 0; day < 14; day++) {
                          for (let hour = 9; hour < 18; hour++) {
                            const count = getAvailabilityCount(day, hour);
                            timeSlotCounts.push({ day, hour, count });
                          }
                        }
                        const top3 = timeSlotCounts
                          .sort((a, b) => b.count - a.count)
                          .slice(0, 3);
                        return (
                          <div className="grid grid-cols-3 gap-2">
                            {top3.map((slot, index) => (
                              <div
                                key={index}
                                className="p-3 bg-background rounded-lg text-center"
                              >
                                <div className="font-bold text-primary">
                                  {index + 1}순위
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {fullDays[slot.day]}
                                </div>
                                <div className="text-sm">{slot.hour}:00</div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="p-4 bg-muted rounded-xl">
                      <h4 className="font-bold text-foreground mb-3">
                        시간대별 인기도 히트맵
                      </h4>
                      <div className="bg-background rounded-lg p-3 overflow-x-auto">
                        <div className="min-w-[700px]">
                          <div
                            className="grid gap-px bg-border select-none border border-border rounded-lg overflow-hidden"
                            style={{
                              gridTemplateColumns: `60px repeat(${fullDays.length}, 1fr)`,
                            }}
                          >
                            <div className="bg-card"></div>
                            {fullDays.map((day, dayIndex) => (
                              <div
                                key={dayIndex}
                                className="text-center py-2 text-xs font-semibold bg-card text-muted-foreground"
                              >
                                {day.split(" ")[0]}
                                <br />
                                <span className="text-xs font-normal">
                                  (7/{dayIndex + 10})
                                </span>
                              </div>
                            ))}
                            {hours.map((hour) => (
                              <React.Fragment key={hour}>
                                <div className="flex items-center justify-center text-xs font-semibold bg-card text-muted-foreground">
                                  {hour}:00
                                </div>
                                {fullDays.map((_, dayIndex) => {
                                  const availableCount = getAvailabilityCount(
                                    dayIndex,
                                    hour
                                  );
                                  const maybeCount = getMaybeCount(
                                    dayIndex,
                                    hour
                                  );
                                  const totalCount =
                                    availableCount + maybeCount;
                                  return (
                                    <TooltipProvider
                                      key={`${dayIndex}-${hour}`}
                                    >
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div
                                            className={`h-6 transition-colors cursor-pointer hover:opacity-80 ${getStatisticsSlotColor(
                                              dayIndex,
                                              hour
                                            )}`}
                                          />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="font-medium">
                                            {fullDays[dayIndex]} {hour}:00
                                          </p>
                                          <p className="text-sm">
                                            가능: {availableCount}명
                                          </p>
                                          <p className="text-sm">
                                            애매: {maybeCount}명
                                          </p>
                                          <p className="text-sm">
                                            총: {totalCount}명
                                          </p>
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
      <Dialog open={showFullCalendar} onOpenChange={setShowFullCalendar}>
        <DialogContent className="max-w-7xl bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              2주 전체 시간표
            </DialogTitle>
          </DialogHeader>
          <div
            className="grid gap-px bg-border select-none border border-border"
            style={{
              gridTemplateColumns: `60px repeat(${fullDays.length}, 1fr)`,
            }}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div className="bg-card"></div>
            {fullDays.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className="text-center py-3 text-sm font-semibold bg-card text-muted-foreground"
              >
                {day.split(" ")[0]}
                <br />
                <span className="text-xs font-normal">(7/{dayIndex + 10})</span>
              </div>
            ))}
            {hours.map((hour) => (
              <React.Fragment key={hour}>
                <div className="flex items-center justify-center text-xs font-semibold bg-card text-muted-foreground">
                  {hour}:00
                </div>
                {fullDays.map((_, dayIndex) => {
                  const slotIndex = getSlotIndex(dayIndex, hour);
                  const slot = timeSlots[slotIndex];
                  return (
                    <div
                      key={`${dayIndex}-${hour}`}
                      className={`h-10 transition-colors ${getSlotColor(
                        slot.status
                      )} ${
                        isLoggedIn
                          ? "cursor-pointer hover:opacity-80"
                          : "cursor-not-allowed"
                      }`}
                      onMouseDown={() => handleMouseDown(dayIndex, hour)}
                      onMouseEnter={() => handleMouseEnter(dayIndex, hour)}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

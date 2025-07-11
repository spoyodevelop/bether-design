"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronDown,
  Plus,
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock3,
  Globe,
  Lock,
  AlertCircle,
  HelpCircle,
  Sun,
  Moon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MeetingSchedulerProps {
  onEventCreate?: () => void;
}

export default function MeetingScheduler({
  onEventCreate,
}: MeetingSchedulerProps) {
  const [activeTab, setActiveTab] = useState<"time" | "location">("time");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("day");
  const [roomName, setRoomName] = useState("");
  const [hasDeadline, setHasDeadline] = useState(true);
  const [isPublic, setIsPublic] = useState("public");
  const [locations, setLocations] = useState<string[]>([""]);
  const [showOptionalSettings, setShowOptionalSettings] = useState(false);
  const [customStartTime, setCustomStartTime] = useState("09:00");
  const [customEndTime, setCustomEndTime] = useState("18:00");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<number[]>([]);
  const [deadlineDate, setDeadlineDate] = useState("2025-07-10");
  const [deadlineTime, setDeadlineTime] = useState("18:30");

  // 달력 드래그 관련 상태
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const addLocation = () => {
    setLocations([...locations, ""]);
  };

  const removeLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  const updateLocation = (index: number, value: string) => {
    const newLocations = [...locations];
    newLocations[index] = value;
    setLocations(newLocations);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // 달력 드래그 관련 함수들
  const handleDateMouseDown = (day: number) => {
    const today = new Date();
    const isCurrentMonth =
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();
    const isPast = isCurrentMonth && day < today.getDate();

    if (isPast) return;

    setIsDragging(true);
    setDragStart(day);
    toggleDateSelection(day);
  };

  const handleDateMouseEnter = (day: number) => {
    if (!isDragging || dragStart === null) return;

    const today = new Date();
    const isCurrentMonth =
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();

    const newSelectedDates = new Set(selectedDates);
    const minDay = Math.min(dragStart, day);
    const maxDay = Math.max(dragStart, day);
    const startSelected = selectedDates.includes(dragStart);

    for (let d = minDay; d <= maxDay; d++) {
      const isPast = isCurrentMonth && d < today.getDate();
      if (isPast) continue;

      if (startSelected) {
        newSelectedDates.delete(d);
      } else {
        newSelectedDates.add(d);
      }
    }

    setSelectedDates(Array.from(newSelectedDates));
  };

  const handleDateMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const toggleDateSelection = (day: number) => {
    setSelectedDates((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleCreateEvent = () => {
    if (onEventCreate) {
      onEventCreate();
    }
  };

  const monthNames = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const today = new Date();
  const isCurrentMonth =
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-primary mb-8">Bether</h1>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Left Panel - Calendar/Location */}
            <div>
              <Card className="border-0 shadow-xl bg-card h-full">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {/* Tabs */}
                    <div className="flex bg-muted rounded-xl p-1.5">
                      <Button
                        variant="ghost"
                        onClick={() => setActiveTab("time")}
                        className={`flex-1 h-11 rounded-lg transition-all font-medium ${
                          activeTab === "time"
                            ? "bg-card text-primary shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        기간
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setActiveTab("location")}
                        className={`flex-1 h-11 rounded-lg transition-all font-medium ${
                          activeTab === "location"
                            ? "bg-card text-primary shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        장소
                      </Button>
                    </div>

                    {/* Content */}
                    {activeTab === "time" ? (
                      <div className="space-y-6">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-foreground">
                            {currentDate.getFullYear()}년{" "}
                            {monthNames[currentDate.getMonth()]}
                          </h3>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigateMonth("prev")}
                              className="w-9 h-9 p-0 border hover:bg-muted"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigateMonth("next")}
                              className="w-9 h-9 p-0 border hover:bg-muted"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Calendar Grid */}
                        <div
                          ref={calendarRef}
                          className="bg-card rounded-xl border p-6 select-none"
                          onMouseUp={handleDateMouseUp}
                          onMouseLeave={handleDateMouseUp}
                        >
                          <div className="grid grid-cols-7 gap-1 mb-4">
                            {["일", "월", "화", "수", "목", "금", "토"].map(
                              (day, index) => (
                                <div
                                  key={day}
                                  className={`text-center py-3 text-sm font-semibold ${
                                    index === 0
                                      ? "text-red-500"
                                      : index === 6
                                      ? "text-primary"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {day}
                                </div>
                              )
                            )}
                          </div>

                          <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: firstDay }, (_, i) => (
                              <div key={`empty-${i}`} className="h-12"></div>
                            ))}
                            {Array.from({ length: daysInMonth }, (_, i) => {
                              const day = i + 1;
                              const isSelected = selectedDates.includes(day);
                              const isPast =
                                isCurrentMonth && day < today.getDate();

                              return (
                                <div
                                  key={day}
                                  onMouseDown={() => handleDateMouseDown(day)}
                                  onMouseEnter={() => handleDateMouseEnter(day)}
                                  className={`h-12 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                                    isPast
                                      ? "text-muted-foreground/50 cursor-not-allowed"
                                      : isSelected
                                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                      : "hover:bg-muted"
                                  } ${
                                    !isPast &&
                                    isCurrentMonth &&
                                    day === today.getDate()
                                      ? "border-2 border-primary"
                                      : ""
                                  }`}
                                >
                                  {day}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-foreground">
                            후보지 작성
                          </h3>
                          <Button onClick={addLocation} size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            추가
                          </Button>
                        </div>

                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                          {locations.map((location, index) => (
                            <div key={index} className="flex gap-3">
                              <Input
                                value={location}
                                onChange={(e) =>
                                  updateLocation(index, e.target.value)
                                }
                                placeholder={`장소 ${index + 1}`}
                                className="flex-1 h-12 text-base"
                              />
                              {locations.length > 1 && (
                                <Button
                                  onClick={() => removeLocation(index)}
                                  size="icon"
                                  variant="ghost"
                                  className="h-12 w-12"
                                >
                                  <X className="w-4 h-4 text-muted-foreground" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Settings */}
            <div className="space-y-8">
              <Card className="border-0 shadow-xl bg-card">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div>
                      <Label
                        htmlFor="room-name"
                        className="text-lg font-bold text-foreground"
                      >
                        방 제목
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1 mb-3">
                        참여자들에게 표시될 방의 제목을 입력해주세요.
                      </p>
                      <Input
                        id="room-name"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        placeholder="예: 1팀 7월 정기 회의"
                        className="text-base"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-lg font-bold text-foreground">
                          시간 선택
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 mb-3">
                        참여자가 선택할 수 있는 시간의 범위를 설정합니다.
                      </p>
                      <div className="flex items-center gap-3">
                        <Button
                          variant={
                            selectedTimeSlot === "day" ? "default" : "outline"
                          }
                          onClick={() => setSelectedTimeSlot("day")}
                          className={cn(
                            "h-12 text-base flex-1 justify-center",
                            selectedTimeSlot === "day"
                              ? "bg-chart-5 hover:bg-chart-5/90 text-primary-foreground border-chart-5"
                              : "text-foreground"
                          )}
                        >
                          <Sun className="mr-2 h-5 w-5" /> 9~18시
                        </Button>
                        <Button
                          variant={
                            selectedTimeSlot === "night" ? "default" : "outline"
                          }
                          onClick={() => setSelectedTimeSlot("night")}
                          className={cn(
                            "h-12 text-base flex-1 justify-center",
                            selectedTimeSlot === "night"
                              ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                              : "text-primary border-primary/20 hover:bg-primary/10 hover:text-primary"
                          )}
                        >
                          <Moon className="mr-2 h-5 w-5" /> 18~24시
                        </Button>
                        <Button
                          variant={
                            selectedTimeSlot === "custom"
                              ? "default"
                              : "outline"
                          }
                          onClick={() => setSelectedTimeSlot("custom")}
                          className="h-12 text-base flex-1 justify-center"
                        >
                          커스텀
                        </Button>
                      </div>
                    </div>

                    {selectedTimeSlot === "custom" && (
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div>
                          <Label htmlFor="start-time">시작</Label>
                          <Input
                            id="start-time"
                            type="time"
                            value={customStartTime}
                            onChange={(e) => setCustomStartTime(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="end-time">종료</Label>
                          <Input
                            id="end-time"
                            type="time"
                            value={customEndTime}
                            onChange={(e) => setCustomEndTime(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Optional Settings */}
              <div className="bg-card rounded-2xl border-0 shadow-xl">
                <button
                  onClick={() => setShowOptionalSettings(!showOptionalSettings)}
                  className="w-full p-6 text-left flex justify-between items-center"
                >
                  <h3 className="text-lg font-bold text-foreground">
                    선택 설정
                  </h3>
                  <ChevronDown
                    className={`transition-transform duration-300 ${
                      showOptionalSettings ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showOptionalSettings && (
                  <div className="p-6 pt-0 space-y-8">
                    {/* Deadline */}
                    <div className="border-t pt-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor="deadline-switch"
                            className="text-base font-semibold text-foreground"
                          >
                            마감 기한
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>마감 기한 이후에는 응답을 받지 않습니다.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Switch
                          id="deadline-switch"
                          checked={hasDeadline}
                          onCheckedChange={setHasDeadline}
                        />
                      </div>
                      {hasDeadline && (
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <Input
                            type="date"
                            value={deadlineDate}
                            onChange={(e) => setDeadlineDate(e.target.value)}
                          />
                          <Input
                            type="time"
                            value={deadlineTime}
                            onChange={(e) => setDeadlineTime(e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Scope */}
                    <div className="border-t pt-6">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-base font-semibold text-foreground">
                          공개 범위
                        </Label>
                      </div>
                      <RadioGroup
                        defaultValue="public"
                        value={isPublic}
                        onValueChange={setIsPublic}
                        className="space-y-3"
                      >
                        <div className="flex items-start gap-3 p-4 rounded-lg border has-[:checked]:border-primary has-[:checked]:bg-muted/50">
                          <RadioGroupItem
                            value="public"
                            id="public"
                            className="mt-1"
                          />
                          <div>
                            <Label
                              htmlFor="public"
                              className="font-semibold flex items-center gap-2"
                            >
                              <Globe className="w-4 h-4" />
                              공개
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              누구나 이 페이지에 접근할 수 있습니다.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 rounded-lg border has-[:checked]:border-primary has-[:checked]:bg-muted/50">
                          <RadioGroupItem
                            value="private"
                            id="private"
                            className="mt-1"
                          />
                          <div>
                            <Label
                              htmlFor="private"
                              className="font-semibold flex items-center gap-2"
                            >
                              <Lock className="w-4 h-4" />
                              비공개
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              링크를 가진 사람만 접근할 수 있습니다.
                            </p>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end pt-4">
                <Button
                  size="lg"
                  className="h-12 text-lg"
                  onClick={handleCreateEvent}
                >
                  방 만들기
                </Button>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <h4 className="font-semibold text-destructive">주의사항</h4>
                  <p className="text-sm text-destructive/80 mt-1">
                    방은 생성 후 30일이 지나면 자동으로 삭제됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

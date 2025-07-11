"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
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
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface MeetingSchedulerProps {
  onEventCreate?: () => void
}

export default function MeetingScheduler({ onEventCreate }: MeetingSchedulerProps) {
  const [activeTab, setActiveTab] = useState<"time" | "location">("time")
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("morning")
  const [roomName, setRoomName] = useState("")
  const [hasDeadline, setHasDeadline] = useState(true)
  const [isPublic, setIsPublic] = useState("public")
  const [locations, setLocations] = useState<string[]>([""])
  const [showOptionalSettings, setShowOptionalSettings] = useState(false)
  const [customStartTime, setCustomStartTime] = useState("09:00")
  const [customEndTime, setCustomEndTime] = useState("18:00")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDates, setSelectedDates] = useState<number[]>([])
  const [deadlineDate, setDeadlineDate] = useState("2025-07-10")
  const [deadlineTime, setDeadlineTime] = useState("18:30")

  // 달력 드래그 관련 상태
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<number | null>(null)
  const calendarRef = useRef<HTMLDivElement>(null)

  const addLocation = () => {
    setLocations([...locations, ""])
  }

  const removeLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index))
  }

  const updateLocation = (index: number, value: string) => {
    const newLocations = [...locations]
    newLocations[index] = value
    setLocations(newLocations)
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  // 달력 드래그 관련 함수들
  const handleDateMouseDown = (day: number) => {
    const today = new Date()
    const isCurrentMonth =
      currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()
    const isPast = isCurrentMonth && day < today.getDate()

    if (isPast) return

    setIsDragging(true)
    setDragStart(day)
    toggleDateSelection(day)
  }

  const handleDateMouseEnter = (day: number) => {
    if (!isDragging || dragStart === null) return

    const today = new Date()
    const isCurrentMonth =
      currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()
    const isPast = isCurrentMonth && day < today.getDate()

    if (isPast) return

    // 드래그 범위 계산
    const minDay = Math.min(dragStart, day)
    const maxDay = Math.max(dragStart, day)

    // 시작점이 선택되어 있는지 확인
    const startSelected = selectedDates.includes(dragStart)

    // 범위 내의 모든 날짜를 시작점과 같은 상태로 설정
    const newSelectedDates = [...selectedDates]

    for (let d = minDay; d <= maxDay; d++) {
      const dayIsPast = isCurrentMonth && d < today.getDate()
      if (dayIsPast) continue

      const isSelected = newSelectedDates.includes(d)

      if (startSelected && !isSelected) {
        newSelectedDates.push(d)
      } else if (!startSelected && isSelected) {
        const index = newSelectedDates.indexOf(d)
        if (index > -1) {
          newSelectedDates.splice(index, 1)
        }
      }
    }

    setSelectedDates(newSelectedDates)
  }

  const handleDateMouseUp = () => {
    setIsDragging(false)
    setDragStart(null)
  }

  const toggleDateSelection = (day: number) => {
    setSelectedDates((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  const handleCreateEvent = () => {
    if (onEventCreate) {
      onEventCreate()
    }
  }

  const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const today = new Date()
  const isCurrentMonth =
    currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-blue-600 mb-8">Bether</h1>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Left Panel - Calendar/Location */}
            <div>
              <Card className="border-0 shadow-xl bg-white h-full">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {/* Tabs */}
                    <div className="flex bg-slate-100 rounded-xl p-1.5">
                      <Button
                        variant="ghost"
                        onClick={() => setActiveTab("time")}
                        className={`flex-1 h-11 rounded-lg transition-all font-medium ${
                          activeTab === "time"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-600 hover:text-slate-800"
                        }`}
                      >
                        기간
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setActiveTab("location")}
                        className={`flex-1 h-11 rounded-lg transition-all font-medium ${
                          activeTab === "location"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-600 hover:text-slate-800"
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
                          <h3 className="text-xl font-bold text-slate-800">
                            {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
                          </h3>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigateMonth("prev")}
                              className="w-9 h-9 p-0 border-slate-200 hover:bg-slate-50"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigateMonth("next")}
                              className="w-9 h-9 p-0 border-slate-200 hover:bg-slate-50"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Calendar Grid */}
                        <div
                          ref={calendarRef}
                          className="bg-white rounded-xl border border-slate-200 p-6 select-none"
                          onMouseUp={handleDateMouseUp}
                          onMouseLeave={handleDateMouseUp}
                        >
                          <div className="grid grid-cols-7 gap-1 mb-4">
                            {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
                              <div
                                key={day}
                                className={`text-center py-3 text-sm font-semibold ${
                                  index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : "text-slate-600"
                                }`}
                              >
                                {day}
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: firstDay }, (_, i) => (
                              <div key={`empty-${i}`} className="h-12"></div>
                            ))}

                            {Array.from({ length: daysInMonth }, (_, i) => {
                              const day = i + 1
                              const isToday = isCurrentMonth && day === today.getDate()
                              const isPast = isCurrentMonth && day < today.getDate()
                              const isSelected = selectedDates.includes(day)

                              return (
                                <button
                                  key={day}
                                  onMouseDown={() => handleDateMouseDown(day)}
                                  onMouseEnter={() => handleDateMouseEnter(day)}
                                  disabled={isPast}
                                  className={`h-12 rounded-lg text-sm font-medium transition-all ${
                                    isPast
                                      ? "text-slate-300 cursor-not-allowed"
                                      : isSelected
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                                        : isToday
                                          ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                                          : "hover:bg-slate-100 text-slate-700 cursor-pointer"
                                  }`}
                                >
                                  {day}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {selectedDates.length > 0 && (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="text-sm font-medium text-blue-800 mb-2">선택된 날짜</div>
                            <div className="flex flex-wrap gap-2">
                              {selectedDates
                                .sort((a, b) => a - b)
                                .map((date) => (
                                  <span
                                    key={date}
                                    className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium"
                                  >
                                    {currentDate.getMonth() + 1}월 {date}일
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-slate-800">후보지 작성</h3>
                          <Button
                            onClick={addLocation}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 h-9"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            추가
                          </Button>
                        </div>

                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {locations.map((location, index) => (
                            <div key={index} className="flex gap-3">
                              <Input
                                value={location}
                                onChange={(e) => updateLocation(index, e.target.value)}
                                placeholder={`장소 ${index + 1}`}
                                className="flex-1 h-12 text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                              />
                              {locations.length > 1 && (
                                <Button
                                  onClick={() => removeLocation(index)}
                                  size="sm"
                                  variant="outline"
                                  className="h-12 w-12 p-0 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300"
                                >
                                  <X className="w-4 h-4" />
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
            <div>
              <Card className="border-0 shadow-xl bg-white h-full">
                <CardContent className="p-8">
                  <div className="space-y-8 h-full flex flex-col">
                    {/* Room Name Input */}
                    <div className="space-y-2">
                      <Label className="text-lg font-semibold text-slate-800">방 이름</Label>
                      <Input
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        placeholder="방 이름을 입력하세요"
                        className="h-12 text-base border-2 border-slate-300 bg-white font-medium"
                      />
                    </div>

                    {/* Time Selection */}
                    <div className="space-y-5">
                      <Label className="text-lg font-semibold text-slate-800">시간 선택</Label>
                      <div className="grid grid-cols-3 gap-3">
                        <Button
                          variant={selectedTimeSlot === "morning" ? "default" : "outline"}
                          onClick={() => setSelectedTimeSlot("morning")}
                          className={`h-12 text-sm font-medium transition-all ${
                            selectedTimeSlot === "morning"
                              ? "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25"
                              : "border-amber-200 text-amber-700 hover:bg-amber-50"
                          }`}
                        >
                          <span className="mr-2">☀️</span>
                          9~18시
                        </Button>
                        <Button
                          variant={selectedTimeSlot === "evening" ? "default" : "outline"}
                          onClick={() => setSelectedTimeSlot("evening")}
                          className={`h-12 text-sm font-medium transition-all ${
                            selectedTimeSlot === "evening"
                              ? "bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                              : "border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                          }`}
                        >
                          <span className="mr-2">🌙</span>
                          18~24시
                        </Button>
                        <Button
                          variant={selectedTimeSlot === "custom" ? "default" : "outline"}
                          onClick={() => setSelectedTimeSlot("custom")}
                          className={`h-12 text-sm font-medium transition-all ${
                            selectedTimeSlot === "custom"
                              ? "bg-slate-800 hover:bg-slate-900 text-white shadow-lg shadow-slate-800/25"
                              : "border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          커스텀
                        </Button>
                      </div>

                      {/* Custom Time Settings */}
                      {selectedTimeSlot === "custom" && (
                        <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl animate-in fade-in-50 duration-200">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                              <Clock className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold text-slate-800">커스텀 시간 설정</span>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="startTime" className="text-sm font-medium text-slate-600">
                                시작 시간
                              </Label>
                              <Input
                                id="startTime"
                                type="time"
                                value={customStartTime}
                                onChange={(e) => setCustomStartTime(e.target.value)}
                                className="h-11 border-slate-200 focus:border-slate-400"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="endTime" className="text-sm font-medium text-slate-600">
                                종료 시간
                              </Label>
                              <Input
                                id="endTime"
                                type="time"
                                value={customEndTime}
                                onChange={(e) => setCustomEndTime(e.target.value)}
                                className="h-11 border-slate-200 focus:border-slate-400"
                              />
                            </div>
                          </div>

                          <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
                            <div className="text-sm text-slate-600">
                              선택된 시간:{" "}
                              <span className="font-medium text-slate-800">
                                {customStartTime} ~ {customEndTime}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Optional Settings Toggle */}
                    <div className="space-y-4 flex-1">
                      <button
                        onClick={() => setShowOptionalSettings(!showOptionalSettings)}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors group"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform group-hover:text-slate-800 ${showOptionalSettings ? "rotate-180" : ""}`}
                        />
                        <span className="text-base font-semibold">추가 기능</span>
                      </button>

                      {showOptionalSettings && (
                        <div className="space-y-6 animate-in slide-in-from-top-2 duration-200">
                          {/* Deadline */}
                          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Clock3 className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <h3 className="text-slate-800 font-semibold">마감 기한</h3>
                                </div>
                                <Switch
                                  checked={hasDeadline}
                                  onCheckedChange={setHasDeadline}
                                  className="data-[state=checked]:bg-blue-600"
                                />
                              </div>
                            </div>

                            {hasDeadline && (
                              <div className="p-5">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label
                                      htmlFor="deadlineDate"
                                      className="text-sm font-medium text-slate-600 flex items-center gap-2"
                                    >
                                      <Calendar className="w-4 h-4 text-blue-500" />
                                      날짜
                                    </Label>
                                    <Input
                                      id="deadlineDate"
                                      type="date"
                                      value={deadlineDate}
                                      onChange={(e) => setDeadlineDate(e.target.value)}
                                      className="h-11 border-slate-200 focus:border-blue-400"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label
                                      htmlFor="deadlineTime"
                                      className="text-sm font-medium text-slate-600 flex items-center gap-2"
                                    >
                                      <Clock className="w-4 h-4 text-blue-500" />
                                      시간
                                    </Label>
                                    <Input
                                      id="deadlineTime"
                                      type="time"
                                      value={deadlineTime}
                                      onChange={(e) => setDeadlineTime(e.target.value)}
                                      className="h-11 border-slate-200 focus:border-blue-400"
                                    />
                                  </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                                  <AlertCircle className="w-4 h-4" />
                                  <span>마감 시간 이후에는 자동으로 결과가 확정됩니다</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Privacy Settings */}
                          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                  {isPublic === "public" ? (
                                    <Globe className="w-5 h-5 text-emerald-600" />
                                  ) : (
                                    <Lock className="w-5 h-5 text-emerald-600" />
                                  )}
                                </div>
                                <h3 className="text-slate-800 font-semibold">공개 설정</h3>
                              </div>
                            </div>

                            <div className="p-5">
                              <RadioGroup value={isPublic} onValueChange={setIsPublic} className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <RadioGroupItem
                                      value="public"
                                      id="public"
                                      className="border-emerald-500 text-emerald-600"
                                    />
                                    <Label
                                      htmlFor="public"
                                      className="ml-3 font-medium text-slate-700 cursor-pointer flex items-center gap-2"
                                    >
                                      공개
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 text-slate-400 hover:text-slate-600 cursor-help" />
                                          </TooltipTrigger>
                                          <TooltipContent side="right" className="max-w-xs bg-slate-900 text-white">
                                            <p>본인 스케줄 투표 후 바로 결과 확인 가능</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </Label>
                                  </div>
                                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <Globe className="w-4 h-4 text-emerald-600" />
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <RadioGroupItem
                                      value="private"
                                      id="private"
                                      className="border-emerald-500 text-emerald-600"
                                    />
                                    <Label
                                      htmlFor="private"
                                      className="ml-3 font-medium text-slate-700 cursor-pointer flex items-center gap-2"
                                    >
                                      비공개
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 text-slate-400 hover:text-slate-600 cursor-help" />
                                          </TooltipTrigger>
                                          <TooltipContent side="right" className="max-w-xs bg-slate-900 text-white">
                                            <p>모임 참여자 모두 투표 완료 후 결과 확인 가능</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </Label>
                                  </div>
                                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <Lock className="w-4 h-4 text-emerald-600" />
                                  </div>
                                </div>
                              </RadioGroup>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Create Button - Full Width */}
                    <div className="pt-4">
                      <Button
                        onClick={handleCreateEvent}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:shadow-blue-600/30 py-4 h-14"
                        disabled={!roomName.trim()}
                      >
                        이벤트 생성하기
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

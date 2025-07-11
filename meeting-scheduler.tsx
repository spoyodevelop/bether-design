import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, ChevronDown } from "lucide-react"

export default function MeetingScheduler() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm">
              <CardContent className="p-8">
                <div className="space-y-8">
                  {/* Room Name */}
                  <div className="text-center">
                    <div className="inline-block border-2 border-black px-8 py-3">
                      <h1 className="text-xl font-medium">방 이름</h1>
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">시간 선택</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" className="bg-red-100 border-red-300 text-red-700">
                        9~6 ☀️
                      </Button>
                      <Button variant="outline" className="bg-yellow-100 border-yellow-300 text-yellow-700">
                        6~12 🌙
                      </Button>
                      <Button variant="outline" className="border-gray-300 bg-transparent">
                        커스텀
                      </Button>
                    </div>
                  </div>

                  {/* Optional Settings */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-sm">
                      <ChevronDown className="w-4 h-4" />
                      <span>optional</span>
                    </div>

                    {/* Deadline */}
                    <div className="border-2 border-red-300 p-4 rounded">
                      <div className="flex items-center gap-3">
                        <Switch defaultChecked className="data-[state=checked]:bg-blue-500" />
                        <Label className="font-medium">마감 기한</Label>
                        <span className="text-sm text-gray-600">2025.7.10 (목) 18:30</span>
                      </div>
                    </div>

                    {/* Privacy Settings */}
                    <div className="border-2 border-red-300 p-4 rounded">
                      <RadioGroup defaultValue="public" className="flex items-center gap-8">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="public" id="public" className="border-blue-500 text-blue-500" />
                          <Label htmlFor="public" className="font-medium">
                            공개
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="private" id="private" />
                          <Label htmlFor="private" className="font-medium">
                            비공개
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="text-red-500 text-sm">?</div>
                  </div>

                  {/* Create Button */}
                  <div className="text-center pt-8">
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-base">
                      이벤트 생성하기
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Calendar and Frames */}
          <div className="space-y-6">
            {/* Calendar Section */}
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Tabs */}
                  <div className="flex">
                    <Button variant="ghost" className="bg-red-100 text-red-700 rounded-r-none border-r">
                      시간
                    </Button>
                    <Button variant="ghost" className="bg-gray-100 text-gray-600 rounded-l-none">
                      장소
                    </Button>
                  </div>

                  {/* Calendar Placeholder */}
                  <div className="bg-gray-200 h-64 flex items-center justify-center rounded">
                    <div className="text-center text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-lg font-medium">달력</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Frame Sections */}
            <div className="space-y-3">
              <div className="bg-red-100 p-4 rounded border-l-4 border-red-400">
                <div className="text-sm text-gray-600 mb-1">Frame 11</div>
                <div className="font-medium">후보지 작성</div>
              </div>

              <div className="bg-red-100 p-4 rounded border-l-4 border-red-400">
                <div className="text-sm text-gray-600 mb-1">Frame 12</div>
              </div>

              <div className="bg-red-100 p-4 rounded border-l-4 border-red-400">
                <div className="text-sm text-gray-600 mb-1">Frame 13</div>
              </div>

              <div className="bg-red-100 p-4 rounded border-l-4 border-red-400">
                <div className="text-sm text-gray-600 mb-1">Frame 14</div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t-2 border-black pt-4">
              <div className="text-center font-medium">방 생성</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

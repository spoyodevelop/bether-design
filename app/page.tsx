"use client"

import { useState } from "react"
import MeetingScheduler from "../components/meeting-scheduler"
import EventCreated from "../components/event-created"

export default function Page() {
  const [showEventCreated, setShowEventCreated] = useState(false)

  const handleEventCreate = () => {
    setShowEventCreated(true)
  }

  if (showEventCreated) {
    return <EventCreated />
  }

  return <MeetingScheduler onEventCreate={handleEventCreate} />
}

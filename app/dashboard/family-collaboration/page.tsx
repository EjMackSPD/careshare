'use client'

import { useState } from 'react'
import Navigation from '@/app/components/Navigation'
import LeftNavigation from '@/app/components/LeftNavigation'
import { UserPlus, MoreVertical, Send, Calendar, Mail, Phone } from 'lucide-react'
import styles from './page.module.css'

type TeamMember = {
  id: string
  name: string
  initials: string
  color: string
  active: boolean
}

type Message = {
  id: string
  sender: string
  text: string
  avatar: string
}

type Event = {
  id: string
  title: string
  description: string
  date: string
  category: string
  categoryColor: string
  attendees: string[]
}

const teamMembers: TeamMember[] = [
  { id: '1', name: 'John Johnson', initials: 'JJ', color: '#10b981', active: true },
  { id: '2', name: 'Sarah Johnson', initials: 'SJ', color: '#8b5cf6', active: true },
  { id: '3', name: 'Michael Johnson', initials: 'MJ', color: '#06b6d4', active: true }
]

const taskDistribution = [
  { name: 'You', percentage: 65, color: '#6366f1' },
  { name: 'Sarah', percentage: 25, color: '#8b5cf6' },
  { name: 'Mike', percentage: 10, color: '#10b981' }
]

const upcomingEvents: Event[] = [
  {
    id: '1',
    title: "Martha Johnson's Favorite Restaurant",
    description: 'A family gathering for dinner at 6:00 PM.',
    date: 'Aug 31',
    category: 'Family Dinner',
    categoryColor: '#6366f1',
    attendees: ['JE', 'SC', 'MD']
  },
  {
    id: '2',
    title: 'Extended Weekend Visit',
    description: 'Mike is coming to stay for the weekend and help with home repairs.',
    date: 'Sep 10',
    category: 'Weekend Visit',
    categoryColor: '#10b981',
    attendees: ['JE', 'MD']
  }
]

export default function FamilyCollaborationPage() {
  const [message, setMessage] = useState('')
  const [messages] = useState<Message[]>([
    { id: '1', sender: 'U', text: '', avatar: '#6366f1' },
    { id: '2', sender: 'U', text: '', avatar: '#6366f1' },
    { id: '3', sender: 'U', text: '', avatar: '#6366f1' }
  ])

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('Sending message:', message)
      setMessage('')
    }
  }

  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />
      
      <div className={styles.layout}>
        <LeftNavigation />
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <div>
              <h1>Family Collaboration</h1>
              <p className={styles.subtitle}>Connect and coordinate with your caregiving team</p>
            </div>
            <button className={styles.inviteBtn}>
              <UserPlus size={18} />
              Invite Family Member
            </button>
          </div>

          <div className={styles.topGrid}>
            {/* Caregiving Team */}
            <div className={styles.card}>
              <h2>Caregiving Team</h2>
              <p className={styles.cardSubtitle}>People helping with Martha Johnson's care</p>
              
              <div className={styles.teamList}>
                {teamMembers.map((member) => (
                  <div key={member.id} className={styles.teamMember}>
                    <div className={styles.avatar} style={{ background: member.color }}>
                      {member.initials}
                    </div>
                    <div className={styles.memberInfo}>
                      <div className={styles.memberName}>{member.name}</div>
                      <div className={styles.memberStatus}>
                        <span className={styles.statusDot}></span>
                        Active now
                      </div>
                    </div>
                    <button className={styles.menuBtn}>
                      <MoreVertical size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <button className={styles.inviteMemberBtn}>
                <UserPlus size={16} />
                Invite Family Member
              </button>
            </div>

            {/* Team Communication */}
            <div className={styles.card}>
              <h2>Team Communication</h2>
              <p className={styles.cardSubtitle}>Messages about Martha Johnson's care</p>
              
              <div className={styles.messagesArea}>
                {messages.map((msg) => (
                  <div key={msg.id} className={styles.messageBubble}>
                    <div className={styles.messageAvatar}>{msg.sender}</div>
                    <div className={styles.messageContent}></div>
                  </div>
                ))}
              </div>

              <div className={styles.messageInput}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={handleSendMessage} className={styles.sendBtn}>
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Task Distribution */}
          <div className={styles.card}>
            <h2>Task Distribution</h2>
            <p className={styles.cardSubtitle}>Current workload distribution</p>
            
            <div className={styles.taskBars}>
              {taskDistribution.map((person) => (
                <div key={person.name} className={styles.taskRow}>
                  <div className={styles.taskName}>{person.name}</div>
                  <div className={styles.taskBarContainer}>
                    <div 
                      className={styles.taskBar}
                      style={{ 
                        width: `${person.percentage}%`,
                        background: person.color
                      }}
                    ></div>
                  </div>
                  <div className={styles.taskPercentage}>{person.percentage}%</div>
                </div>
              ))}
            </div>

            <button className={styles.rebalanceBtn}>Rebalance Tasks</button>
          </div>

          {/* Upcoming Family Events */}
          <div className={styles.eventsSection}>
            <h2>Upcoming Family Events</h2>
            
            <div className={styles.eventsGrid}>
              {upcomingEvents.map((event) => (
                <div key={event.id} className={styles.eventCard}>
                  <div className={styles.eventHeader}>
                    <span 
                      className={styles.eventCategory}
                      style={{ background: event.categoryColor }}
                    >
                      {event.category}
                    </span>
                    <div className={styles.eventDate}>
                      <Calendar size={14} />
                      {event.date}
                    </div>
                  </div>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  <div className={styles.eventAttendees}>
                    {event.attendees.map((attendee, idx) => (
                      <div key={idx} className={styles.attendeeAvatar}>
                        {attendee}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className={styles.scheduleEventCard}>
                <Calendar size={48} className={styles.calendarIcon} />
                <h3>Plan a Family Event</h3>
                <p>Schedule time together to coordinate care and connect</p>
                <button className={styles.scheduleBtn}>Schedule Event</button>
              </div>
            </div>
          </div>

          {/* Family Contact Information */}
          <div className={styles.contactSection}>
            <h2>Family Contact Information</h2>
            
            <div className={styles.contactGrid}>
              <div className={styles.contactCard}>
                <div className={styles.contactAvatar} style={{ background: '#10b981' }}>
                  JJ
                </div>
                <h3>John Johnson</h3>
                <div className={styles.contactInfo}>
                  <Mail size={14} />
                  <span>john@example.com</span>
                </div>
                <div className={styles.contactInfo}>
                  <Phone size={14} />
                  <span>Phone not available</span>
                </div>
              </div>

              <div className={styles.contactCard}>
                <div className={styles.contactAvatar} style={{ background: '#8b5cf6' }}>
                  SJ
                </div>
                <h3>Sarah Johnson</h3>
                <div className={styles.contactInfo}>
                  <Mail size={14} />
                  <span>sarah@example.com</span>
                </div>
                <div className={styles.contactInfo}>
                  <Phone size={14} />
                  <span>Phone not available</span>
                </div>
              </div>

              <div className={styles.contactCard}>
                <div className={styles.contactAvatar} style={{ background: '#06b6d4' }}>
                  MJ
                </div>
                <h3>Michael Johnson</h3>
                <div className={styles.contactInfo}>
                  <Mail size={14} />
                  <span>michael@example.com</span>
                </div>
                <div className={styles.contactInfo}>
                  <Phone size={14} />
                  <span>Phone not available</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


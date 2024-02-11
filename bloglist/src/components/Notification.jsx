import { useContext } from 'react'
import './Notification.css'
import NotificationContext from '../NotificationContext'

const Notification = () => {
  const [notification] = useContext(NotificationContext)
  if (notification) {
    const { text, color } = notification
    return (
      <div
        className="notification"
        style={{ color: color, borderColor: color }}
      >
        {text}
      </div>
    )
  }
}

export default Notification

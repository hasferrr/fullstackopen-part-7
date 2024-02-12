import { useContext } from 'react'
import NotificationContext from '../NotificationContext'
import { Alert } from '@mui/material'
import './Notification.css'

const Notification = () => {
  const [notification] = useContext(NotificationContext)

  if (notification) {
    const { text, color } = notification
    const saverity =
      color === 'green' ? 'success' : color === 'red' ? 'error' : 'info'
    return (
      <Alert variant="filled" severity={saverity} className="notification">
        {text}
      </Alert>
    )
  }
}

export default Notification

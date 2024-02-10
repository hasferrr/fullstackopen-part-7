import './Notification.css'

const Notification = ({ notification }) => {
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

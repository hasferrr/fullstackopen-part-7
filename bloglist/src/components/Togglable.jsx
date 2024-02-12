import { Button } from '@mui/material'
import { useState } from 'react'

const Togglable = (props) => {
  const [visible, setVisible] = useState(false)

  const hideWhenVisible = { display: visible ? 'none' : '' }
  const showWhenVisible = { display: visible ? '' : 'none' }

  return (
    <div>
      <div style={hideWhenVisible}>
        <Button
          variant="contained"
          size="small"
          onClick={() => setVisible(!visible)}
        >
          {props.label}
        </Button>
      </div>
      <div style={showWhenVisible}>
        {props.children}
        <Button
          variant="contained"
          size="small"
          onClick={() => setVisible(!visible)}
        >
          cancel
        </Button>
      </div>
    </div>
  )
}

export default Togglable

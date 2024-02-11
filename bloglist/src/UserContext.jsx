import { createContext, useContext, useReducer } from 'react'

const UserContext = createContext()

const userReducer = (state, action) => {
  switch (action.type) {
    case 'SET':
      return action.payload
    default:
      return state
  }
}

export const UserContextProvider = (props) => {
  const [user, userDispatch] = useReducer(userReducer, null)
  return (
    <UserContext.Provider value={[user, userDispatch]}>
      {props.children}
    </UserContext.Provider>
  )
}

export const useUserValue = () => {
  const user = useContext(UserContext)[0]
  return user
}

export const useUserDispatch = () => {
  const userDispatch = useContext(UserContext)[1]
  return userDispatch
}

export default UserContext

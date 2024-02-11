import { useState, useEffect, useContext } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import Notification from './components/Notification'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'
import NotificationContext from './NotificationContext'

const App = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [_, notificationDispatch] = useContext(NotificationContext)

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedUser')
    if (loggedUserJSON) {
      const loggedUser = JSON.parse(loggedUserJSON)
      setUser(loggedUser)
      blogService.setToken(loggedUser.token)
    }
  }, [])

  const setBlogs = (value) => {
    const sorted = [...value]
    sorted.sort((a, b) => b.likes - a.likes)
    return sorted
  }

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const loggedUser = await loginService.login({ username, password })
      window.localStorage.setItem('loggedUser', JSON.stringify(loggedUser))
      blogService.setToken(loggedUser.token)

      setUser(loggedUser)
      setUsername('')
      setPassword('')
      notificationDispatch({ type: 'CLEAR' })
    } catch (error) {
      showShortNotification('wrong username or password', 'red')
    }
  }

  const handleLogout = () => {
    window.localStorage.clear()
    setUser(null)
    notificationDispatch({ type: 'CLEAR' })
  }

  // Query Client
  const queryClient = useQueryClient()

  // Mutations
  const newBlogMutation = useMutation({
    mutationFn: blogService.create,
    onSuccess: (result) => {
      const blogs = queryClient.getQueryData(['blogs'])
      queryClient.setQueryData(
        ['blogs'],
        blogs.concat({
          ...result,
          user: {
            id: result.user,
            name: user.name,
            username: user.username,
          },
        })
      )
      showShortNotification(
        `a new Blog ${result.title} by ${result.author}`,
        'green'
      )
    },
  })

  const updateBlogMutation = useMutation({
    mutationFn: blogService.update,
    onSuccess: (result) => {
      const blogs = queryClient.getQueryData(['blogs'])
      queryClient.setQueryData(
        ['blogs'],
        blogs.map((blog) =>
          blog.id === result.id
            ? {
                ...result,
                user: {
                  id: result.user,
                  name: user.name,
                  username: user.username,
                },
              }
            : blog
        )
      )
    },
  })

  const deleteBlogMutation = useMutation({
    mutationFn: blogService.deleteById,
    onSuccess: (result) => {
      const blogs = queryClient.getQueryData(['blogs'])
      queryClient.setQueryData(
        ['blogs'],
        blogs.filter((blog) => blog.id !== result.id)
      )
    },
  })

  // Handler
  const createNewBlog = async (newBlog) => {
    newBlogMutation.mutate(newBlog)
  }

  const updateBlog = async (id, blog) => {
    updateBlogMutation.mutate({ id, blog })
  }

  const deleteBlog = async (id) => {
    deleteBlogMutation.mutate(id)
  }

  // Helpers
  const showShortNotification = (text, color) => {
    notificationDispatch({ type: 'SET', payload: { text, color } })
    setTimeout(() => notificationDispatch({ type: 'CLEAR' }), 5000)
  }

  // Use Query
  const result = useQuery({
    queryKey: ['blogs'],
    queryFn: blogService.getAll,
    refetchOnWindowFocus: false,
  })

  if (result.isLoading) {
    return <div>loading data...</div>
  }

  const blogs = setBlogs(result.data)

  if (user === null) {
    return (
      <div>
        <h2>log in to application</h2>
        <Notification />
        <form onSubmit={handleLogin}>
          <div>
            username
            <input
              id="username"
              type="text"
              value={username}
              onChange={({ target: { value } }) => setUsername(value)}
            />
          </div>
          <div>
            password
            <input
              id="password"
              type="password"
              value={password}
              onChange={({ target: { value } }) => setPassword(value)}
            />
          </div>
          <div>
            <button id="login-button" type="submit">
              login
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div>
      <h2>blogs</h2>
      <Notification />
      <p>
        {user.name} logged in
        <button onClick={handleLogout}>logout</button>
      </p>

      <Togglable label="new blog">
        <BlogForm createNewBlog={createNewBlog} />
      </Togglable>
      <br />

      {blogs.map((blog) => (
        <Blog
          key={blog.id}
          blog={blog}
          updateBlog={updateBlog}
          deleteBlog={deleteBlog}
          user={user}
        />
      ))}
    </div>
  )
}

export default App

import { useState, useEffect, useContext } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Blog from './components/Blog'
import Blogs from './components/Blogs'
import blogService from './services/blogs'
import loginService from './services/login'
import userService from './services/users'
import Notification from './components/Notification'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'
import User from './components/User'
import Users from './components/Users'
import NotificationContext from './NotificationContext'
import { useUserDispatch, useUserValue } from './UserContext'
import { Link, Route, Routes, useMatch, useNavigate } from 'react-router-dom'
import './App.css'

const App = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [_, notificationDispatch] = useContext(NotificationContext)

  const user = useUserValue()
  const userDispatch = useUserDispatch()

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedUser')
    if (loggedUserJSON) {
      const loggedUser = JSON.parse(loggedUserJSON)
      userDispatch({ type: 'SET', payload: loggedUser })
      blogService.setToken(loggedUser.token)
    }
  }, [])

  const navigate = useNavigate()

  // Use Match
  const userMatch = useMatch('/users/:id')
  const blogMatch = useMatch('/blogs/:id')

  // Login handler
  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const loggedUser = await loginService.login({ username, password })
      window.localStorage.setItem('loggedUser', JSON.stringify(loggedUser))
      blogService.setToken(loggedUser.token)
      userDispatch({ type: 'SET', payload: loggedUser })
      setUsername('')
      setPassword('')
      notificationDispatch({ type: 'CLEAR' })
    } catch (error) {
      showShortNotification('wrong username or password', 'red')
    }
  }

  const handleLogout = () => {
    window.localStorage.clear()
    userDispatch({ type: 'SET', payload: null })
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
      const users = queryClient.getQueryData(['users'])
      queryClient.setQueryData(
        ['users'],
        users.map((u) =>
          u.id === result.user ? { ...u, blogs: [...u.blogs, result] } : u
        )
      )
      showShortNotification(
        `a new Blog ${result.title} by ${result.author}`,
        'green'
      )
      navigate(`/blogs/${result.id}`)
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
                  name: blog.user.name,
                  username: blog.user.username,
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
      const users = queryClient.getQueryData(['users'])
      queryClient.setQueryData(
        ['users'],
        users.map((u) =>
          u.username === user.username
            ? { ...u, blogs: u.blogs.filter((blog) => blog.id !== result.id) }
            : u
        )
      )
      navigate('/blogs')
    },
  })

  // Handler
  const createNewBlog = (newBlog) => {
    newBlogMutation.mutate(newBlog)
  }

  const updateBlog = (id, blog) => {
    updateBlogMutation.mutate({ id, blog })
  }

  const deleteBlog = (id) => {
    deleteBlogMutation.mutate(id)
  }

  // Helpers
  const showShortNotification = (text, color) => {
    notificationDispatch({ type: 'SET', payload: { text, color } })
    setTimeout(() => notificationDispatch({ type: 'CLEAR' }), 5000)
  }

  const setBlogs = (value) => {
    const sorted = [...value]
    sorted.sort((a, b) => b.likes - a.likes)
    return sorted
  }

  // Use Query
  const blogsResult = useQuery({
    queryKey: ['blogs'],
    queryFn: blogService.getAll,
    refetchOnWindowFocus: false,
  })

  const usersResult = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
    refetchOnWindowFocus: false,
  })

  if (blogsResult.isLoading || usersResult.isLoading) {
    return <div>loading data...</div>
  }

  const blogs = setBlogs(blogsResult.data)
  const users = usersResult.data

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
      <nav className="nav">
        <Link to="/blogs">blogs</Link>
        <Link to="/users">users</Link>
        <div>
          {user.name} logged in
          <button onClick={handleLogout}>logout</button>
        </div>
      </nav>

      <h2>Blog App</h2>
      <Notification />

      <Routes>
        <Route
          path="/users"
          element={
            <>
              <h2>Users</h2>
              <Users users={users} />
              <br />
            </>
          }
        />
        <Route
          path="/users/:id"
          element={
            <User
              user={
                userMatch
                  ? users.find((u) => u.id === userMatch.params.id)
                  : null
              }
            />
          }
        />
      </Routes>

      <Togglable label="new blog">
        <BlogForm createNewBlog={createNewBlog} />
      </Togglable>
      <br />

      <Routes>
        <Route path="/blogs" element={<Blogs blogs={blogs} />}></Route>
        <Route
          path="/blogs/:id"
          element={
            <Blog
              blog={
                blogMatch
                  ? blogs.find((blog) => blog.id === blogMatch.params.id)
                  : null
              }
              updateBlog={updateBlog}
              deleteBlog={deleteBlog}
            />
          }
        />
      </Routes>
    </div>
  )
}

export default App

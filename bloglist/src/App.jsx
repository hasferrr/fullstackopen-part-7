import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import Notification from './components/Notification'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'

const App = () => {
  const [blogs, setBlogsUnsorted] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    blogService.getAll().then((blogs) => setBlogs(blogs))
  }, [])

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
    setBlogsUnsorted(sorted)
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
      setNotification(null)
    } catch (error) {
      showShortNotification('wrong username or password', 'red')
    }
  }

  const handleLogout = () => {
    window.localStorage.clear()
    setUser(null)
    setNotification(null)
  }

  const createNewBlog = async (newBlog) => {
    const result = await blogService.create(newBlog)
    setBlogs([
      ...blogs,
      {
        ...result,
        user: {
          id: result.user,
          name: user.name,
          username: user.username,
        },
      },
    ])
    showShortNotification(
      `a new Blog ${result.title} by ${result.author}`,
      'green'
    )
  }

  const updateBlog = async (id, updatedBlog) => {
    const result = await blogService.update(id, updatedBlog)
    setBlogs(
      [...blogs].map((blog) =>
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
  }

  const deleteBlog = async (id) => {
    await blogService.deleteById(id)
    setBlogs([...blogs].filter((blog) => blog.id !== id))
  }

  const showShortNotification = (text, color) => {
    setNotification({ text, color })
    setTimeout(() => setNotification(null), 5000)
  }

  if (user === null) {
    return (
      <div>
        <h2>log in to application</h2>
        <Notification notification={notification} />
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
      <Notification notification={notification} />
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

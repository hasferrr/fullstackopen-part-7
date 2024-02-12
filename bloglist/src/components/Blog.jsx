import PropTypes from 'prop-types'
import { useUserValue } from '../UserContext'

const Blog = ({ blog, updateBlog, deleteBlog }) => {
  const user = useUserValue()

  if (!blog) {
    return null
  }

  const incrementLike = () => {
    updateBlog(blog.id, {
      user: blog.user.id,
      likes: blog.likes + 1,
      author: blog.author,
      title: blog.title,
      url: blog.url,
    })
  }

  const handleDelete = () => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)) {
      deleteBlog(blog.id)
    }
  }

  return (
    <div>
      <h2>{blog.title}</h2>
      <div>
        <a href={blog.url}>{blog.url}</a>
        <div>
          likes {blog.likes}
          <button onClick={incrementLike}>like</button>
        </div>
        <div>added by {blog.user.name}</div>
        {user.username === blog.user.username ? (
          <button onClick={handleDelete}>remove</button>
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}

Blog.propTypes = {
  blog: PropTypes.object,
  updateBlog: PropTypes.func.isRequired,
  deleteBlog: PropTypes.func.isRequired,
}

export default Blog

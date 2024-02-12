import PropTypes from 'prop-types'
import { useUserValue } from '../UserContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, TextField } from '@mui/material'

const Blog = ({ blog, updateBlog, deleteBlog }) => {
  const user = useUserValue()

  const queryClient = useQueryClient()
  const updateCommentsintheFrontend = useMutation({
    mutationFn: (c) => c,
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

  const handleAddComment = (event) => {
    event.preventDefault()
    const comment = event.target.comment.value
    updateCommentsintheFrontend.mutate({
      ...blog,
      comments: blog.comments ? [...blog.comments, comment] : [comment],
    })
    event.target.comment.value = ''
  }

  return (
    <div>
      <h2>{blog.title}</h2>
      <div>
        <a href={blog.url}>{blog.url}</a>
        <div>
          likes {blog.likes}
          <Button size="small" variant="contained" onClick={incrementLike}>
            like
          </Button>
        </div>
        <div>added by {blog.user.name}</div>
        {user.username === blog.user.username ? (
          <Button size="small" variant="contained" onClick={handleDelete}>
            remove
          </Button>
        ) : (
          <></>
        )}
      </div>

      <h3>comments</h3>
      <form onSubmit={handleAddComment}>
        <div>
          <TextField size="small" label="comment" type="text" name="comment" />
          <Button variant="contained" type="submit">
            add comment
          </Button>
        </div>
      </form>
      <ul>
        {blog.comments
          ? blog.comments.map((comment, index) => (
              <li key={index}>{comment}</li>
            ))
          : null}
      </ul>
    </div>
  )
}

Blog.propTypes = {
  blog: PropTypes.object,
  updateBlog: PropTypes.func.isRequired,
  deleteBlog: PropTypes.func.isRequired,
}

export default Blog

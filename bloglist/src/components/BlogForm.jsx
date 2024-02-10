import PropTypes from 'prop-types'
import { useState } from 'react'

const BlogForm = ({ createNewBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const handleCreateNewBlog = (event) => {
    event.preventDefault()
    createNewBlog({ title, author, url })
    setTitle('')
    setAuthor('')
    setUrl('')
  }

  return (
    <div>
      <h2>create new</h2>
      <form onSubmit={handleCreateNewBlog}>
        <div>
          title:
          <input
            id="title"
            type="text"
            value={title}
            onChange={({ target: { value } }) => setTitle(value)}
          />
        </div>
        <div>
          author:
          <input
            id="author"
            type="text"
            value={author}
            onChange={({ target: { value } }) => setAuthor(value)}
          />
        </div>
        <div>
          url:
          <input
            id="url"
            type="text"
            value={url}
            onChange={({ target: { value } }) => setUrl(value)}
          />
        </div>
        <div>
          <button id="add-note-button" type="submit">
            create
          </button>
        </div>
      </form>
    </div>
  )
}

BlogForm.propTypes = {
  createNewBlog: PropTypes.func.isRequired,
}

export default BlogForm

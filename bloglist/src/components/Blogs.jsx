import { Link } from 'react-router-dom'
import './Blogs.css'
import { Paper } from '@mui/material'

const Blogs = ({ blogs }) => {
  return (
    <>
      {blogs.map((blog) => (
        <Paper  className="blogs" key={blog.id}>
          <Link to={`/blogs/${blog.id}`}>{blog.title}</Link>
        </Paper>
      ))}
    </>
  )
}

export default Blogs

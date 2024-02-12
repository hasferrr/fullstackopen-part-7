import { Link } from 'react-router-dom'
import './Blogs.css'

const Blogs = ({ blogs }) => {
  return (
    <>
      {blogs.map((blog) => (
        <div className="blogs" key={blog.id}>
          <Link to={`/blogs/${blog.id}`}>{blog.title}</Link>
        </div>
      ))}
    </>
  )
}

export default Blogs

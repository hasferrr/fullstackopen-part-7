import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'

test('test for the new blog form', async () => {
  const createNewBlog = jest.fn()
  const user = userEvent.setup()

  render(<BlogForm createNewBlog={createNewBlog} />)

  const inputs = screen.getAllByRole('textbox')
  const submitButton = screen.getByText('create')

  await user.type(inputs[0], 'title')
  await user.type(inputs[1], 'author')
  await user.type(inputs[2], 'url.com')
  await user.click(submitButton)

  expect(createNewBlog.mock.calls).toHaveLength(1)
  expect(createNewBlog.mock.calls[0][0].title).toBe('title')
  expect(createNewBlog.mock.calls[0][0].author).toBe('author')
  expect(createNewBlog.mock.calls[0][0].url).toBe('url.com')
})

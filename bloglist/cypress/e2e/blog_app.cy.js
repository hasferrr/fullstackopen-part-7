describe('Blog app', function () {
  beforeEach(function () {
    cy.request('POST', 'http://localhost:3003/api/testing/reset')
    cy.request('POST', 'http://localhost:3003/api/users', {
      username: 'hasferrr',
      password: '12345678',
      name: 'Hasfer',
    })
    cy.request('POST', 'http://localhost:3003/api/users', {
      username: 'xyz',
      password: 'qwertyuiop',
      name: 'Xyz',
    })
    cy.visit('http://localhost:5173')
  })

  it('Login form is shown', function () {
    cy.contains('log in to application')
    cy.contains('username')
    cy.contains('password')
    cy.contains('login')
  })

  describe('Login', function () {
    it('succeeds with correct credentials', function () {
      cy.get('#username').type('hasferrr')
      cy.get('#password').type('12345678')
      cy.get('#login-button').click()
      cy.contains('blogs')
      cy.contains('Hasfer logged in')
      cy.contains('logout')
    })

    it('fails with wrong credentials', function () {
      cy.get('#username').type('hasferrr')
      cy.get('#password').type('wrongpassword')
      cy.get('#login-button').click()
      cy.get('.notification')
        .should('contain', 'wrong username or password')
        .and('have.css', 'color', 'rgb(255, 0, 0)')
    })
  })

  describe('When logged in', function () {
    beforeEach(function () {
      cy.login({
        username: 'hasferrr',
        password: '12345678',
      })
      cy.createBlog({ title: 'Blog1', author: 'Author1', url: 'url1.com' })
      cy.createBlog({ title: 'Blog2', author: 'Author2', url: 'url2.com' })
    })

    it('A blog can be created', function () {
      cy.contains('new blog').click()
      cy.get('#title').type('How to Code')
      cy.get('#author').type('Famous Person')
      cy.get('#url').type('example.com')
      cy.get('#add-note-button').click()
      cy.get('.notification')
        .should('contain', 'a new Blog How to Code by Famous Person')
        .and('have.css', 'color', 'rgb(0, 128, 0)')
    })

    it('Users can like a blog', function () {
      cy.contains('Blog1 by Author1')
        .parent()
        .as('Blog1')

      cy.get('@Blog1')
        .contains('show')
        .click()

      cy.contains('likes 0')

      cy.get('@Blog1')
        .contains('like')
        .click()

      cy.contains('likes 1')
    })

    it('Users can delete a blog', function () {
      cy.contains('Blog2 by Author2')
        .parent()
        .as('Blog2')

      cy.get('@Blog2')
        .contains('show')
        .click()

      cy.get('@Blog2')
        .contains('remove')
        .click()

      cy.should('not.contain', 'Blog2 by Author2')
    })
  })

  describe('When logged in and another User have a blog', function () {
    beforeEach(function () {
      cy.login({
        username: 'xyz',
        password: 'qwertyuiop',
      })
      cy.createBlog({ title: 'XYZs Blog', author: 'Author0', url: 'url0.com' })
      cy.contains('logout').click()
      cy.login({
        username: 'hasferrr',
        password: '12345678',
      })
      cy.createBlog({ title: 'Blog1', author: 'Author1', url: 'url1.com' })
      cy.createBlog({ title: 'Blog2', author: 'Author2', url: 'url2.com' })
    })

    it('Users cannot see another user remove button', function () {
      cy.contains('XYZs Blog')
        .parent()
        .as('XYZs-Blog')

      cy.get('@XYZs-Blog')
        .contains('show')
        .click()

      cy.should('not.contain', 'remove')
    })

    it('Blogs are ordered according to likes', function () {
      cy.get('.blog')
        .eq(0)
        .should('contain', 'XYZs Blog by Author0')
        .contains('show').click()
      cy.get('.blog')
        .eq(1)
        .should('contain', 'Blog1 by Author1')
        .contains('show').click()
      cy.get('.blog')
        .eq(2)
        .should('contain', 'Blog2 by Author2')
        .contains('show').click()

      for (let i = 0; i < 3; i++) {
        cy.contains('Blog1 by Author1')
          .parent()
          .contains('like')
          .click()
        cy.wait(500)
      }

      for (let i = 0; i < 1; i++) {
        cy.contains('XYZs Blog by Author0')
          .parent()
          .contains('like')
          .click()
        cy.wait(500)
      }

      for (let i = 0; i < 4; i++) {
        cy.contains('Blog2 by Author2')
          .parent()
          .contains('like')
          .click()
        cy.wait(500)
      }

      cy.get('.blog')
        .eq(0)
        .should('contain', 'Blog2 by Author2')
        .and('contain', 'likes 4')
      cy.get('.blog')
        .eq(1)
        .should('contain', 'Blog1 by Author1')
        .and('contain', 'likes 3')
      cy.get('.blog')
        .eq(2)
        .should('contain', 'XYZs Blog by Author0')
        .and('contain', 'likes 1')
    })
  })
})

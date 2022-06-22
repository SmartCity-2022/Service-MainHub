describe('show error message if the email input field is empty', () => {
    it("displays an error message if the email input field is empty", () => {
        cy.visit("/auth")
        cy.get("#formBasicPassword").type('secret1234')
        cy.get("#submitLogin").click()
        cy.get("#errLogin").should("exist")
    })
})

describe('show error message if the password input field is empty', () => {
    it("displays an error message if the password input field is empty", () => {
        cy.visit("/auth")
        cy.get("#formBasicEmail").type('example.email@test.de')
        cy.get("#submitLogin").click()
        cy.get("#errLogin").should("exist")
    })
})
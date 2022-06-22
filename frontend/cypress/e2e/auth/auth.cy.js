describe('switch from login component to register component', () => {
    it("renders the register component after the login component", () => {
        cy.visit("/auth")
        cy.get("#auth-tab-tab-registerUser").click()
        cy.get("#repeatPassword").should('exist')
    })
})
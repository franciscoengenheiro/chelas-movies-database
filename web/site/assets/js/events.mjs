// Module that contains all the functions used to handle user events

'use strict'

// Disables a nav-link (link from navbar) when the user is in the page represented 
// by the current pathname location
document.querySelectorAll('.nav-link').forEach(navLink => {
    if (navLink.href.includes(`${location.pathname}`))
    navLink.classList.add('disabled')
})

// Get top navbar element
const navbar = document.getElementById('topNavBar')
let last_scroll_top = 0
// Fire this event each time the scrollbar is moved from its current position.
// It hides the navbar when scrolling down and pops it when scrolling back up.
window.addEventListener('scroll', function() {
    const offset = navbar.offsetHeight 
    // Sets this variable to the current body position in the y-axis
    let scroll_top = window.scrollY 
    // Only allow this changes when scrollbar as passed the navbar height
    if (scroll_top >= offset) {
        if (scroll_top < last_scroll_top) {
            // Pop navbar
            navbar.classList.remove('scrolled-down')
            navbar.classList.add('scrolled-up')
        } else {
            // Hide navbar
            navbar.classList.remove('scrolled-up')
            navbar.classList.add('scrolled-down')
        }
        last_scroll_top = scroll_top
    }
})

document.addEventListener("DOMContentLoaded", (e) => { 
    const auth = "/auth"
    const currPathName = window.location.pathname
    checkIfPathNameChanged(currPathName)
    // Assert what pagination limit should be used based on each page requirements
    switch(true) {
        case currPathName == `${auth}/groups`: paginationButtons(6); break
        case currPathName.includes(`${auth}/groups`): paginationButtons(9); break
        default: paginationButtons(10)
    }
})

function checkIfPathNameChanged(currPathName) {
    const prevPathName = sessionStorage.getItem('prevPathName') 
    // If a value isn't stored in the session storage, set one
    if (!prevPathName) sessionStorage.setItem('prevPathName', currPathName)
    if (currPathName != prevPathName) {
        // Remove page and totalPages key values from the session storage
        // they're current value is not needed in the another page location
        sessionStorage.removeItem('page')
        sessionStorage.removeItem('totalPages')
        sessionStorage.setItem('prevPathName', currPathName)
    }
}

// Defines the pagination buttons logic and events associated with them
function paginationButtons(limit) {
    // Get pagination data
    let page = sessionStorage.getItem('page') ? parseInt(sessionStorage.getItem('page')) : 1
    let totalPages = retrieveAndSetTotalPages()
    function retrieveAndSetTotalPages() {
        const pagNavBar = document.getElementById("paginationNavBar")
        sessionStorage.setItem('totalPages', pagNavBar.dataset.totalpages)
        return pagNavBar.dataset.totalpages
    }

    // Disable pagination buttons according to the current page
    if (page == 1) {
        document.getElementById('firstPageItem').classList.add('disabled') 
        document.getElementById('prevPageItem').classList.add('disabled')
    }
    if (page >= totalPages) {
        document.getElementById('nextPageItem').classList.add('disabled') 
        document.getElementById('lastPageItem').classList.add('disabled')
    }

    // Button click event listeners for each pagination button that update the 
    // current page when avalaible
    document.getElementById('firstPageBtn').addEventListener('click', () => {
        page = 1; updatePageNumber(page)
    })

    document.getElementById('prevPageBtn').addEventListener('click', () => {
        page = page > 1 ? page - 1 : page; updatePageNumber(page)
    })

    document.getElementById('nextPageBtn').addEventListener('click', () => {
        page = page < totalPages ? page + 1 : page; updatePageNumber(page)
    })

    document.getElementById('lastPageBtn').addEventListener('click', () => {
        page = totalPages; updatePageNumber(page)
    })

    function updatePageNumber(page) {
        if (sessionStorage.getItem('page') != page) {
            // Retrieve current page location
            const url = new URL(window.location)
            // Set query string values
            url.searchParams.set('limit', limit)
            url.searchParams.set('page', page)
            // Save current page value
            sessionStorage.setItem('page', page)
            // Update page
            window.location.href = url.toString()
        }
    }
}

// Retrieve search movies form input data on the submit event and sets the form 
// action
document.getElementById('searchMoviesForm').addEventListener('submit', (e) => {
    // Retrieve input field value
    const movieName = document.getElementById('movieName').value
    // Knowing the name of the movie, the form action can be set
    e.target.action = `/movies/search/${movieName}`
})
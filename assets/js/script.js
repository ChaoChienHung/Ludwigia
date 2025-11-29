// Initialize AOS
AOS.init({
  duration: 900,
  offset: 80,
});

// Fade-in / slide-down navbar on hover near top
const navbar = document.querySelector('.custom-nav');
const hoverAreaHeight = 50; // pixels from top

window.addEventListener('mousemove', function(e) {
  if (e.clientY <= hoverAreaHeight) {
    navbar.classList.add('show');
  } else if (!navbar.matches(':hover')) {
    // Hide only if mouse not hovering navbar
    navbar.classList.remove('show');
  }
});

// Hide navbar slightly after mouse leaves
navbar.addEventListener('mouseleave', function() {
  setTimeout(() => {
    if (!navbar.matches(':hover')) {
      navbar.classList.remove('show');
    }
  }, 300); // 0.3s delay for smooth disappearance
});

// Make parent link navigate on click even with dropdown
document.querySelectorAll('.dropdown-toggle').forEach(function(dropdown) {
  dropdown.addEventListener('click', function(e) {
    if (window.innerWidth >= 992) { // only for desktop
      window.location.href = this.href;
    }
  });
});
// Initialize AOS
AOS.init({
  duration: 900,
  offset: 80,
});

const navbar = document.querySelector('.custom-nav');

let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  const current = window.scrollY;

  if (current > lastScrollY && current > 80) {
    // scrolling DOWN → show navbar
    navbar.classList.add('show');
  } else if (current < lastScrollY) {
    // scrolling UP → hide navbar
    navbar.classList.remove('show');
  }

  lastScrollY = current;
});

// Dropdown parent link clickable on desktop
document.querySelectorAll('.dropdown-toggle').forEach(function(dropdown) {
  dropdown.addEventListener('click', function(e) {
    if (window.innerWidth >= 992) {
      window.location.href = this.href;
    }
  });
});

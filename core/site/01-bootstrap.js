if (window.AOS && typeof window.AOS.init === 'function') {
  window.AOS.init({
    duration: 900,
    offset: 80,
  });
}

const navbar = document.querySelector('.custom-nav');

if (navbar) {
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const current = window.scrollY;

    if (current > lastScrollY && current > 80) {
      navbar.classList.add('show');
    } else if (current < lastScrollY) {
      navbar.classList.remove('show');
    }

    lastScrollY = current;
  });
}

// Dropdown parent link clickable on desktop
document.querySelectorAll('.dropdown-toggle').forEach(function(dropdown) {
  dropdown.addEventListener('click', function() {
    if (window.innerWidth >= 992) {
      const href = String(this.getAttribute('href') || '');
      if (!href || href === '#') return;
      window.location.href = this.href;
    }
  });
});

const themeToggle = document.getElementById("theme-toggle");


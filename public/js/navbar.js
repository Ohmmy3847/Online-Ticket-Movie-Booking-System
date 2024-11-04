const userMenuButton = document.getElementById('user-menu-button');
    const userDropdown = document.getElementById('user-dropdown');

    userMenuButton.addEventListener('click', () => {
      userDropdown.classList.toggle('hidden');
    });

    // Toggle mobile menu
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    mobileMenuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    // Toggle mobile user dropdown
    const mobileUserMenuButton = document.getElementById('mobile-user-menu-button');
    const mobileUserDropdown = document.getElementById('mobile-user-dropdown');

    mobileUserMenuButton.addEventListener('click', () => {
      mobileUserDropdown.classList.toggle('hidden');
    });

    function confirmSignOut(event) {
      event.preventDefault();
      if (confirm('ต้องการ logout?')) {
        document.getElementById('signoutForm').submit();
      }
    }
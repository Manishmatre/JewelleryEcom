/**
 * ShilpoKotha Signup Page Functionality
 * This file contains JavaScript functionality specific to the signup page
 */

import { registerUser, signInWithGoogle } from './firebase-config.js';
import { saveUserProfile } from './local-storage.js';
import { checkAuthState } from './auth-state.js';

// Document ready event
document.addEventListener('DOMContentLoaded', () => {
  // Add animation class for the announcement bar
  const style = document.createElement('style');
  style.textContent = `
    .animate-marquee {
      animation: marquee 30s linear infinite;
    }
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
  `;
  document.head.appendChild(style);

  // Mobile menu toggle
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const closeMobileMenuButton = document.getElementById('close-mobile-menu');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuContent = mobileMenu.querySelector('div');

  mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.remove('hidden');
    setTimeout(() => {
      mobileMenuContent.style.transform = 'translateX(0)';
    }, 10);
  });

  closeMobileMenuButton.addEventListener('click', () => {
    mobileMenuContent.style.transform = 'translateX(-100%)';
    setTimeout(() => {
      mobileMenu.classList.add('hidden');
    }, 300);
  });

  // Mobile collections dropdown
  const mobileCollectionsButton = document.getElementById('mobile-collections-button');
  const mobileCollectionsMenu = document.getElementById('mobile-collections-menu');
  const mobileCollectionsIcon = document.getElementById('mobile-collections-icon');

  if (mobileCollectionsButton && mobileCollectionsMenu) {
    mobileCollectionsButton.addEventListener('click', () => {
      mobileCollectionsMenu.classList.toggle('hidden');
      if (mobileCollectionsIcon) {
        mobileCollectionsIcon.classList.toggle('rotate-180');
      }
    });
  }

  // Mobile search toggle
  const mobileSearchButton = document.getElementById('mobile-search-button');
  const mobileSearch = document.getElementById('mobile-search');

  if (mobileSearchButton && mobileSearch) {
    mobileSearchButton.addEventListener('click', () => {
      mobileSearch.classList.toggle('hidden');
    });
  }

  // Google Sign-in Button
  const googleSignInButton = document.getElementById('google-signin');
  const signupSuccess = document.getElementById('signup-success');
  const signupFail = document.getElementById('signup-fail');

  if (googleSignInButton) {
    googleSignInButton.addEventListener('click', async () => {
      try {
        // Show loading state
        googleSignInButton.innerHTML = '<div class="flex items-center justify-center"><div class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2"></div> Signing up...</div>';
        googleSignInButton.disabled = true;
        
        // Sign in with Google
        const result = await signInWithGoogle();
        
        if (result.success) {
          // Save user data to local storage
          const user = result.user;
          saveUserProfile(user, {
            displayName: user.displayName || '',
            email: user.email,
            photoURL: user.photoURL || ''
          });
          
          // Show success message
          signupSuccess.textContent = 'Google sign-in successful! Redirecting to home page...';
          signupSuccess.classList.remove('hidden');
          signupFail.classList.add('hidden');
          
          // Redirect to profile page after successful signup
          setTimeout(() => {
            window.location.href = 'profile.html';
          }, 2000);
        } else {
          // Show error message
          signupFail.textContent = result.error || 'Google sign-in failed. Please try again.';
          signupFail.classList.remove('hidden');
          signupSuccess.classList.add('hidden');
          
          // Reset button
          googleSignInButton.innerHTML = '<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="w-5 h-5 mr-2"> Sign up with Google';
          googleSignInButton.disabled = false;
          
          setTimeout(() => {
            signupFail.classList.add('hidden');
          }, 5000);
        }
      } catch (error) {
        console.error('Error during Google sign-in:', error);
        signupFail.textContent = 'An error occurred during Google sign-in. Please try again.';
        signupFail.classList.remove('hidden');
        signupSuccess.classList.add('hidden');
        
        // Reset button
        googleSignInButton.innerHTML = '<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="w-5 h-5 mr-2"> Sign up with Google';
        googleSignInButton.disabled = false;
        
        setTimeout(() => {
          signupFail.classList.add('hidden');
        }, 5000);
      }
    });
  }

  // Signup form validation and Firebase integration
  const signupForm = document.getElementById('signup-form');
  
  if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      let valid = true;
      
      // Name validation
      const nameInput = document.getElementById('name');
      const nameError = document.getElementById('name-error');
      
      if (!nameInput.value.trim()) {
        nameError.textContent = 'Please enter your name.';
        nameError.classList.remove('hidden');
        valid = false;
      } else {
        nameError.classList.add('hidden');
      }
      
      // Email validation
      const emailInput = document.getElementById('email');
      const emailError = document.getElementById('email-error');
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!emailInput.value.trim()) {
        emailError.textContent = 'Please enter your email.';
        emailError.classList.remove('hidden');
        valid = false;
      } else if (!emailPattern.test(emailInput.value.trim())) {
        emailError.textContent = 'Please enter a valid email address.';
        emailError.classList.remove('hidden');
        valid = false;
      } else {
        emailError.classList.add('hidden');
      }
      
      // Password validation
      const passwordInput = document.getElementById('password');
      const passwordError = document.getElementById('password-error');
      
      if (!passwordInput.value.trim()) {
        passwordError.textContent = 'Please enter a password.';
        passwordError.classList.remove('hidden');
        valid = false;
      } else if (passwordInput.value.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters.';
        passwordError.classList.remove('hidden');
        valid = false;
      } else {
        passwordError.classList.add('hidden');
      }
      
      // Confirm password validation
      const confirmInput = document.getElementById('confirm');
      const confirmError = document.getElementById('confirm-error');
      
      if (!confirmInput.value.trim()) {
        confirmError.textContent = 'Please confirm your password.';
        confirmError.classList.remove('hidden');
        valid = false;
      } else if (confirmInput.value !== passwordInput.value) {
        confirmError.textContent = 'Passwords do not match.';
        confirmError.classList.remove('hidden');
        valid = false;
      } else {
        confirmError.classList.add('hidden');
      }
      
      // Show success or fail message
      const signupSuccess = document.getElementById('signup-success');
      const signupFail = document.getElementById('signup-fail');
      
      if (valid) {
        try {
          // Show loading state
          const submitButton = signupForm.querySelector('button[type="submit"]');
          const originalButtonText = submitButton.innerHTML;
          submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Creating Account...';
          submitButton.disabled = true;
          
          // Prepare user data
          const userData = {
            displayName: nameInput.value.trim()
          };
          
          // Register with Firebase
          const result = await registerUser(emailInput.value.trim(), passwordInput.value, userData);
          
          if (result.success) {
            // Save user data to local storage
            saveUserProfile(result.user, {
              displayName: nameInput.value.trim(),
              email: emailInput.value.trim()
            });
            
            // Show success message
            signupSuccess.classList.remove('hidden');
            signupFail.classList.add('hidden');
            
            // Reset form
            signupForm.reset();
            
            // Redirect to profile page after successful signup
            setTimeout(() => {
              window.location.href = 'profile.html';
            }, 2000);
          } else {
            // Show error message
            signupFail.textContent = result.error || 'Signup failed. Please try again.';
            signupFail.classList.remove('hidden');
            signupSuccess.classList.add('hidden');
            
            setTimeout(() => {
              signupFail.classList.add('hidden');
            }, 5000);
          }
        } catch (error) {
          console.error('Error during signup:', error);
          signupFail.textContent = 'An unexpected error occurred. Please try again.';
          signupFail.classList.remove('hidden');
          signupSuccess.classList.add('hidden');
          
          setTimeout(() => {
            signupFail.classList.add('hidden');
          }, 5000);
        } finally {
          // Restore button state
          const submitButton = signupForm.querySelector('button[type="submit"]');
          submitButton.innerHTML = 'Sign Up';
          submitButton.disabled = false;
        }
      } else {
        signupSuccess.classList.add('hidden');
        signupFail.classList.remove('hidden');
        setTimeout(() => {
          signupFail.classList.add('hidden');
        }, 3000);
      }
    });
  }
});
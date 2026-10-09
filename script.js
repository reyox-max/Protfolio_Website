(function () {
  var fireflyHost = document.querySelector(".hero__fireflies");
  var fireflies = [
    ["8%", "76%", "-1.2s", "6.2s", "3px"],
    ["14%", "87%", "-4.4s", "7.8s", "4px"],
    ["19%", "63%", "-3.1s", "7.2s", "4px"],
    ["23%", "70%", "-2.6s", "8.4s", "3px"],
    ["31%", "91%", "-6.1s", "7.1s", "5px"],
    ["37%", "66%", "-1.8s", "8.1s", "3px"],
    ["42%", "79%", "-3.8s", "9.2s", "3px"],
    ["51%", "69%", "-0.9s", "6.8s", "4px"],
    ["55%", "95%", "-4.7s", "7.6s", "4px"],
    ["59%", "88%", "-5.5s", "8.7s", "3px"],
    ["67%", "75%", "-2.1s", "7.4s", "5px"],
    ["73%", "94%", "-6.7s", "9.5s", "3px"],
    ["80%", "66%", "-3.3s", "7.9s", "4px"],
    ["88%", "83%", "-1.7s", "8.9s", "3px"],
    ["95%", "72%", "-5.9s", "6.5s", "4px"],
  ];

  if (fireflyHost) {
    fireflies.forEach(function (firefly) {
      var element = document.createElement("i");
      element.style.setProperty("--left", firefly[0]);
      element.style.setProperty("--top", firefly[1]);
      element.style.setProperty("--delay", firefly[2]);
      element.style.setProperty("--duration", firefly[3]);
      element.style.setProperty("--size", firefly[4]);
      fireflyHost.appendChild(element);
    });
  }

  var hero = document.querySelector(".hero");
  var animationFrame = 0;

  if (hero && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener(
      "pointermove",
      function (event) {
        if (animationFrame) {
          window.cancelAnimationFrame(animationFrame);
        }
        animationFrame = window.requestAnimationFrame(function () {
          hero.style.setProperty(
            "--parallax-x",
            (event.clientX / window.innerWidth - 0.5).toFixed(3)
          );
          hero.style.setProperty(
            "--parallax-y",
            (event.clientY / window.innerHeight - 0.5).toFixed(3)
          );
        });
      },
      { passive: true }
    );

    document.documentElement.addEventListener("mouseleave", function () {
      hero.style.setProperty("--parallax-x", "0");
      hero.style.setProperty("--parallax-y", "0");
    });
  }

  var carousel = document.querySelector(".project-carousel");
  var cards = carousel
    ? Array.prototype.slice.call(carousel.querySelectorAll(".project-card"))
    : [];
  var indicators = Array.prototype.slice.call(
    document.querySelectorAll(".project-progress button")
  );

  function setActiveProject(index) {
    indicators.forEach(function (indicator, indicatorIndex) {
      var isActive = index === indicatorIndex;
      indicator.classList.toggle("is-active", isActive);
      if (isActive) {
        indicator.setAttribute("aria-current", "true");
      } else {
        indicator.removeAttribute("aria-current");
      }
    });
  }

  indicators.forEach(function (indicator, index) {
    indicator.addEventListener("click", function () {
      if (cards[index]) {
        carousel.scrollTo({
          left: cards[index].offsetLeft - carousel.offsetLeft,
          behavior: "smooth",
        });
        setActiveProject(index);
      }
    });
  });

  if (carousel) {
    carousel.addEventListener(
      "scroll",
      function () {
        var closestIndex = 0;
        var closestDistance = Infinity;
        cards.forEach(function (card, index) {
          var distance = Math.abs(card.offsetLeft - carousel.scrollLeft);
          if (distance < closestDistance) {
            closestIndex = index;
            closestDistance = distance;
          }
        });
        setActiveProject(closestIndex);
      },
      { passive: true }
    );
  }

  var form = document.querySelector(".message-form");
  var messageInput = document.querySelector("#message");
  var formStatus = document.querySelector(".form-status");

  if (form && messageInput && formStatus) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!messageInput.value.trim()) {
        messageInput.focus();
        return;
      }
      formStatus.textContent = "Message sent!";
      messageInput.value = "";
      messageInput.placeholder = "Message sent!";
    });

    messageInput.addEventListener("input", function () {
      formStatus.textContent = "";
      messageInput.placeholder = "Enter Your Message";
    });
  }

  var main = document.querySelector("main");
  var heroStage = document.querySelector(".hero-stage");
  var stackedSections = [
    {
      element: document.querySelector(".about-section"),
      offset: "--intro-offset",
    },
    {
      element: document.querySelector(".projects-section"),
      offset: "--projects-offset",
    },
    {
      element: document.querySelector(".footer"),
      offset: "--footer-offset",
    },
  ];
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function getStickyOffset(property) {
    return (
      Number.parseFloat(window.getComputedStyle(main).getPropertyValue(property)) ||
      0
    );
  }

  function getDocumentTop(element) {
    var top = main.getBoundingClientRect().top + window.scrollY;
    var child = main.firstElementChild;

    while (child && child !== element) {
      var childStyle = window.getComputedStyle(child);
      top +=
        child.getBoundingClientRect().height +
        (Number.parseFloat(childStyle.marginTop) || 0) +
        (Number.parseFloat(childStyle.marginBottom) || 0);
      child = child.nextElementSibling;
    }

    if (!child) {
      return element.offsetTop;
    }

    return top + (Number.parseFloat(window.getComputedStyle(element).marginTop) || 0);
  }

  function getSectionStop(section) {
    return Math.max(
      0,
      getDocumentTop(section.element) - getStickyOffset(section.offset)
    );
  }

  document.addEventListener("click", function (event) {
    var link =
      event.target.closest && event.target.closest('a[href^="#"]');
    if (
      !link ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      link.hasAttribute("download") ||
      (link.target && link.target !== "_self")
    ) {
      return;
    }

    var targetId = link.getAttribute("href").slice(1);
    var targetSection = stackedSections.find(function (section) {
      return section.element && section.element.id === targetId;
    });
    var targetPosition;

    if (heroStage && heroStage.id === targetId) {
      targetPosition = 0;
    } else if (targetSection) {
      targetPosition = getSectionStop(targetSection);
    } else {
      return;
    }

    event.preventDefault();
    window.history.pushState(null, "", "#" + targetId);
    window.scrollTo({
      top: targetPosition,
      behavior: reducedMotion.matches ? "auto" : "smooth",
    });
  });

  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll(".main-nav__link")
  );
  var navSections = navLinks
    .map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          navLinks.forEach(function (link) {
            var active = link.hash === "#" + entry.target.id;
            link.classList.toggle("is-active", active);
            if (active) {
              link.setAttribute("aria-current", "location");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      { rootMargin: "-25% 0px -60% 0px" }
    );
    navSections.forEach(function (section) {
      navObserver.observe(section);
    });
  }
})();

/* =============================================================
   Ferat Taş — Portfolio
   i18n + dynamic rendering + interactions
   ============================================================= */
(function () {
  "use strict";

  /* ---------------- UI strings ---------------- */
  const I18N = {
    tr: {
      "meta.description": "Çok kiracılı SaaS mimarileri, RBAC sistemleri ve ölçeklenebilir RESTful API geliştirme konularında uzman, backend odaklı yazılım geliştirici. Flutter mobil geliştirme.",
      "nav.about": "Hakkımda", "nav.experience": "Deneyim", "nav.projects": "Projeler",
      "nav.skills": "Yetenekler", "nav.programs": "Programlar", "nav.contact": "İletişim", "nav.cv": "CV İndir",
      "nav.cvPreview": "Tarayıcıda Önizle", "nav.cvTr": "Türkçe CV", "nav.cvEn": "İngilizce CV", "nav.cvDownload": "PDF · İndir",
      "hero.available": "Yeni fırsatlara açık", "hero.hi": "Merhaba, ben", "hero.iam": "Ben bir",
      "hero.summary": "Çok kiracılı SaaS mimarileri, RBAC sistemleri ve ölçeklenebilir RESTful API geliştirme konularında deneyimli, backend odaklı bir yazılım geliştiriciyim.",
      "hero.cta.work": "Projelerime Bak", "hero.cta.contact": "İletişime Geç", "hero.scroll": "Kaydır",
      "about.title": "Hakkımda",
      "about.lead": "Üretim ortamına yönelik backend servis tasarımı, veritabanı şeması modelleme ve güvenli veri erişim mekanizmaları üzerinde çalışan, backend odaklı bir yazılım geliştiriciyim.",
      "about.body": "Sürdürülebilirlik ve sistem ölçeklenebilirliğini önceliklendiren modüler, katmanlı mimariler geliştirme deneyimine sahibim. Veri hassasiyeti gerektiren uygulamalarda deterministik skor motorları ve yetkilendirme akışları geliştirdim. Mobil tarafta ise servis odaklı yapılar ve state management yaklaşımlarıyla Flutter uygulamaları geliştirdim.",
      "experience.title": "Profesyonel Deneyim",
      "projects.title": "Öne Çıkan Projeler",
      "projects.live": "Canlı Site",
      "skills.title": "Teknik Yetkinlikler",
      "programs.title": "Liderlik & Programlar", "programs.verify": "Sertifikayı Doğrula",
      "credentials.title": "Sertifikalar & Eğitim", "credentials.certs": "Sertifikalar",
      "credentials.education": "Eğitim", "credentials.languages": "Diller",
      "credentials.verifyAll": "Doğrulanmış profilim",
      "contact.title": "İletişime Geç", "contact.heading": "Birlikte çalışalım",
      "contact.text": "Yeni projeler, iş birlikleri veya bir merhaba için her zaman açığım. En hızlı şekilde aşağıdaki kanallardan ulaşabilirsin.",
      "contact.form.name": "Ad Soyad", "contact.form.email": "E-posta", "contact.form.subject": "Konu",
      "contact.form.message": "Mesaj", "contact.form.send": "Gönder",
      "contact.form.sending": "Gönderiliyor…", "contact.form.ok": "Teşekkürler! Mesaj uygulaman açılıyor.",
      "contact.form.okphp": "Mesajın gönderildi, teşekkürler! En kısa sürede döneceğim.",
      "contact.form.err": "Bir şeyler ters gitti. Lütfen doğrudan e-posta gönder.",
      "footer.role": "Software Developer", "footer.rights": "Tüm hakları saklıdır.",
      "a11y.skip": "İçeriğe geç", "doc.title": "Ferat Taş — Yazılım Geliştirici"
    },
    en: {
      "meta.description": "Backend-focused software developer specializing in multi-tenant SaaS architectures, RBAC systems, and scalable RESTful APIs. Flutter mobile development.",
      "nav.about": "About", "nav.experience": "Experience", "nav.projects": "Projects",
      "nav.skills": "Skills", "nav.programs": "Programs", "nav.contact": "Contact", "nav.cv": "Download CV",
      "nav.cvPreview": "Preview in browser", "nav.cvTr": "Turkish CV", "nav.cvEn": "English CV", "nav.cvDownload": "PDF · Download",
      "hero.available": "Open to new opportunities", "hero.hi": "Hi, I'm", "hero.iam": "I'm a",
      "hero.summary": "Backend-focused software developer with hands-on experience in multi-tenant SaaS architectures, RBAC systems, and scalable RESTful API development.",
      "hero.cta.work": "View My Work", "hero.cta.contact": "Get in Touch", "hero.scroll": "Scroll",
      "about.title": "About Me",
      "about.lead": "A backend-focused software developer with hands-on experience in backend service design, database schema modeling, and secure data access mechanisms in production-oriented environments.",
      "about.body": "I have experience building modular, layered architectures with a focus on maintainability and system scalability. I developed deterministic scoring engines and authorization workflows in data-sensitive applications. On the mobile side, I built Flutter applications using service-oriented structures and state management patterns.",
      "experience.title": "Professional Experience",
      "projects.title": "Featured Projects",
      "projects.live": "Visit Live Site",
      "skills.title": "Technical Skills",
      "programs.title": "Leadership & Programs", "programs.verify": "Verify Certificate",
      "credentials.title": "Certifications & Education", "credentials.certs": "Certifications",
      "credentials.education": "Education", "credentials.languages": "Languages",
      "credentials.verifyAll": "My verified profile",
      "contact.title": "Get in Touch", "contact.heading": "Let's work together",
      "contact.text": "I'm always open to new projects, collaborations, or just a friendly hello. Reach me fastest through the channels below.",
      "contact.form.name": "Full Name", "contact.form.email": "Email", "contact.form.subject": "Subject",
      "contact.form.message": "Message", "contact.form.send": "Send",
      "contact.form.sending": "Sending…", "contact.form.ok": "Thanks! Opening your mail app.",
      "contact.form.okphp": "Your message was sent, thank you! I'll get back to you soon.",
      "contact.form.err": "Something went wrong. Please email me directly.",
      "footer.role": "Software Developer", "footer.rights": "All rights reserved.",
      "a11y.skip": "Skip to content", "doc.title": "Ferat Taş — Software Developer"
    }
  };

  /* ---------------- Hero typed roles ---------------- */
  const TYPED = {
    tr: ["Backend Geliştirici", "SaaS Mimar Adayı", "Flutter Geliştirici", "API Tasarımcısı"],
    en: ["Backend Developer", "SaaS Architect", "Flutter Developer", "API Designer"]
  };

  /* ---------------- Content data (bilingual) ----------------
     NOTE: This embedded object is the OFFLINE FALLBACK. When the site
     is served over http(s), js loads data/content.json (editable from
     the /admin panel) and overrides this. Opening index.html directly
     from disk (file://) keeps working thanks to this copy. */
  let DATA = {
    stats: [
      { num: "5+", tr: "Üretim Odaklı Proje", en: "Production-Oriented Projects" },
      { num: "6+", tr: "Programlama Dili & Framework", en: "Languages & Frameworks" },
      { num: "5", tr: "Profesyonel Sertifika", en: "Professional Certifications" },
      { num: "B1", tr: "İngilizce Seviyesi", en: "English Level" }
    ],
    experience: [
      {
        company: "Keşfed Bilişim",
        role: { tr: "Yazılım Geliştirici Stajyeri", en: "Software Developer Intern" },
        date: { tr: "Freelancer", en: "Freelancer" },
        bullets: {
          tr: [
            "Organizasyon bazlı veri izolasyonu sağlayan çok kiracılı bir yönetim sisteminin geliştirilmesine katkı sağladım.",
            "Rol Tabanlı Erişim Kontrolü (RBAC) yetkilendirme yapısının uygulanmasında görev aldım.",
            "RESTful API tasarımı ve backend servis geliştirme süreçlerine katıldım.",
            "İlişkisel veritabanı şeması tasarımı ve veri modelleme çalışmalarında yer aldım.",
            "Audit log ve güvenli veri erişim mekanizmalarının uygulanmasına destek verdim."
          ],
          en: [
            "Contributed to a multi-tenant management system with organization-based data isolation.",
            "Supported the implementation of a Role-Based Access Control (RBAC) authorization structure.",
            "Participated in RESTful API design and backend service development.",
            "Contributed to relational database schema design and data modeling.",
            "Implemented basic audit logging and secure data access mechanisms."
          ]
        }
      },
      {
        company: { tr: "Oyun ve Uygulama Akademisi", en: "Game and Application Academy" },
        role: { tr: "Flutter Geliştirici (Bootcamp)", en: "Flutter Developer (Bootcamp)" },
        date: { tr: "Ara 2023 – Ağu 2024", en: "Dec 2023 – Aug 2024" },
        bullets: {
          tr: [
            "Kimlik doğrulama, kullanıcı yönlendirme ve rezervasyon akışlarını içeren çok ekranlı Flutter uygulaması geliştirdim.",
            "UI – Service – Data Layer ayrımı ile katmanlı mimari tasarladım.",
            "Provider tabanlı state management uyguladım ve Firebase entegrasyonu gerçekleştirdim.",
            "Modüler skor ve ilerleme sistemi geliştirdim.",
            "AllGötür uygulaması ile yüzlerce proje arasından finalist seçildim."
          ],
          en: [
            "Developed a multi-screen Flutter application with authentication, user routing, and reservation flows.",
            "Designed layered architecture (UI – Service – Data Layer).",
            "Implemented Provider-based state management and Firebase integration.",
            "Built modular scoring and progression logic.",
            "Selected as a finalist among hundreds of projects with the AllGötür application."
          ]
        }
      }
    ],
    projects: [
      {
        icon: "🏥", name: "Nodus",
        badge: { tr: "Platform", en: "Platform" },
        sub: { tr: "Çok Kiracılı Klinik Yönetim Platformu", en: "Multi-Tenant Clinical Management Platform" },
        bullets: {
          tr: [
            "organization_id tabanlı veri izolasyonu ile multi-tenant mimari tasarladım.",
            "Rol Tabanlı Erişim Kontrolü (RBAC) sistemi geliştirdim.",
            "Seans planlama, takvim ve uzman atama için REST tabanlı servisler geliştirdim.",
            "Veri koruma prensiplerine uygun audit log ve güvenli erişim mekanizmaları tasarladım."
          ],
          en: [
            "Designed a multi-tenant architecture using organization_id-based data isolation.",
            "Implemented a Role-Based Access Control (RBAC) authorization system.",
            "Built REST-based services for session scheduling, calendar, and expert assignment.",
            "Designed audit logging and secure data access aligned with data protection principles."
          ]
        },
        tags: ["Multi-Tenant", "RBAC", "REST API", "Spring Boot"]
      },
      {
        icon: "🧠",
        name: { tr: "AI Psikometrik Platform", en: "AI Psychometric Platform" },
        badge: { tr: "AI", en: "AI" },
        sub: { tr: "Yapay Zekâ Destekli Değerlendirme", en: "AI-Supported Assessment" },
        bullets: {
          tr: [
            "Şeffaf ve tekrar üretilebilir değerlendirme için deterministik skor motoru geliştirdim.",
            "3 katmanlı mimari tasarladım: Skor Motoru, Bağlam Katmanı, AI Yorum Katmanı.",
            "Uzman kullanıcılar için risk analizi ve karar destek modülü geliştirdim.",
            "Psikolojik değerlendirmeler için ölçeklenebilir değerlendirme altyapısı kurdum."
          ],
          en: [
            "Developed a deterministic scoring engine for transparent, repeatable evaluations.",
            "Designed a 3-layer architecture: Scoring Core, Context Layer, AI Interpretation Layer.",
            "Implemented a risk analysis and decision-support module for expert users.",
            "Built a scalable evaluation pipeline for psychological assessments."
          ]
        },
        tags: ["Scoring Engine", "AI", "Risk Analysis", "Python"]
      },
      {
        icon: "❤️",
        name: "Health SDK",
        badge: { tr: "SDK", en: "SDK" },
        sub: { tr: "Platformlar Arası Sağlık Verisi Entegrasyonu", en: "Cross-Platform Health Data Integration" },
        bullets: {
          tr: [
            "Flutter SDK ile Google Health Connect, Huawei Health Kit ve Apple HealthKit entegrasyonu yaptım.",
            "12+ sağlık metriği için normalizasyon ve delta senkronizasyon geliştirdim.",
            "Yinelenen veri önleme ve otomatik sağlayıcı tespit mekanizmaları tasarladım.",
            "Go, Kotlin, Swift ve Dart ile platformlar arası veri eşleme yapıları oluşturdum."
          ],
          en: [
            "Integrated Google Health Connect, Huawei Health Kit, and Apple HealthKit via Flutter SDK.",
            "Implemented normalization and delta synchronization for 12+ health metrics.",
            "Designed duplicate prevention and automatic provider detection mechanisms.",
            "Built cross-platform data mapping using Go, Kotlin, Swift, and Dart."
          ]
        },
        tags: ["Flutter", "Go", "Kotlin", "Swift", "HealthKit"]
      },
      {
        icon: "📣",
        name: "AdBridger",
        badge: { tr: "MVP", en: "MVP" }, live: true,
        sub: { tr: "Yapay Zekâ Tabanlı Reklam Platformu", en: "AI-Based Advertising Platform" },
        bullets: {
          tr: [
            "Influencer–marka eşleştirme mantığı için ilişkisel veritabanı şeması tasarladım.",
            "Kampanya, teklif ve kullanıcı yaşam döngüsü için backend akışlarını planladım.",
            "Platform güven modellemesi için çift yönlü puanlama algoritması tasarladım.",
            "MVP için REST tabanlı backend mimarisi kurguladım."
          ],
          en: [
            "Designed a relational database schema for influencer–brand matching logic.",
            "Planned backend flows for campaign, offer, and user lifecycle management.",
            "Designed a bidirectional rating algorithm for platform trust modeling.",
            "Architected a REST-based backend structure for MVP implementation."
          ]
        },
        tags: ["Database Design", "REST API", "Matching Algorithm"]
      },
      {
        icon: "🍽️",
        name: "AllGötür",
        badge: { tr: "Finalist", en: "Finalist" },
        sub: { tr: "Mobil Gıda Bağış Platformu", en: "Mobile Food Donation Platform" },
        bullets: {
          tr: [
            "Restoranlardaki fazla gıdaları ihtiyaç sahipleriyle eşleştiren mobil uygulama geliştirdim.",
            "Kullanıcı doğrulama, bağış oluşturma, rezervasyon ve teslim akışlarını tasarladım.",
            "SDG odaklı veri işleme için Gemini API entegrasyonu yaptım.",
            "Bootcamp sürecinde finalist proje olarak seçildim."
          ],
          en: [
            "Developed a mobile app that matches surplus restaurant food with people in need.",
            "Designed user verification, donation, reservation, and pickup flows.",
            "Integrated the Gemini API for SDG-related data processing.",
            "Selected as a bootcamp finalist project."
          ]
        },
        tags: ["Flutter", "Firebase", "Gemini API"]
      },
      {
        icon: "🛒",
        name: { tr: "Özyılmaz B2B E-Ticaret", en: "Özyılmaz B2B E-Commerce" },
        badge: { tr: "Canlı", en: "Live" }, live: true,
        sub: { tr: "Bayi & Toptan Satış Platformu", en: "Dealer & Wholesale Sales Platform" },
        link: "https://ozyilmazb2b.com/",
        bullets: {
          tr: [
            "Next.js ve TypeScript ile uçtan uca full-stack B2B satış platformu geliştirdim.",
            "Prisma + PostgreSQL ile ürün, sipariş ve bayi yönetimi veri modeli kurdum.",
            "Iyzico ödeme entegrasyonu, JWT/bcrypt kimlik doğrulama ve rol bazlı yetkilendirme uyguladım.",
            "Upstash Redis ile hız sınırlama (rate limiting) ve görsel yönetimi mekanizmaları ekledim."
          ],
          en: [
            "Built an end-to-end full-stack B2B sales platform with Next.js and TypeScript.",
            "Modeled products, orders, and dealer management with Prisma + PostgreSQL.",
            "Implemented Iyzico payment integration, JWT/bcrypt auth, and role-based authorization.",
            "Added rate limiting with Upstash Redis and asset management mechanisms."
          ]
        },
        tags: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Iyzico"]
      },
      {
        icon: "🍫",
        name: { tr: "Hemel's Chocolate", en: "Hemel's Chocolate" },
        badge: { tr: "Canlı", en: "Live" }, live: true,
        sub: { tr: "Lüks Çikolata Atölyesi & Kafe", en: "Luxury Chocolate Atelier & Café" },
        link: "https://hemelschocolate.com.tr/",
        bullets: {
          tr: [
            "Premium çikolata markası için kurumsal web deneyimi geliştirdim.",
            "Ürün vitrini, atölye/etkinlik rezervasyon ve üyelik (The Club) bölümlerini kurguladım.",
            "Marka kimliğine uygun, mobil uyumlu ve SEO odaklı bir tasarım uyguladım."
          ],
          en: [
            "Developed the corporate web experience for a premium chocolate brand.",
            "Built product showcase, workshop/event reservation, and membership (The Club) sections.",
            "Implemented a brand-aligned, mobile-friendly, SEO-focused design."
          ]
        },
        tags: ["Web", "Responsive", "SEO", "UI/UX"]
      },
      {
        icon: "💄",
        name: { tr: "Aris Güzellik Merkezi", en: "Aris Beauty Center" },
        badge: { tr: "Canlı", en: "Live" }, live: true,
        sub: { tr: "Güzellik & Estetik Merkezi Web Sitesi", en: "Beauty & Aesthetics Center Website" },
        link: "https://arisezgidogankayseri.com/",
        bullets: {
          tr: [
            "Güzellik & estetik merkezi için kurumsal tanıtım web sitesi geliştirdim.",
            "Hizmet tanıtımı, galeri, müşteri yorumları ve S.S.S. bölümlerini kurguladım.",
            "Online randevu/iletişim formu ve WhatsApp entegrasyonu ile mobil uyumlu bir deneyim sundum."
          ],
          en: [
            "Developed a corporate website for a beauty & aesthetics center.",
            "Built service showcase, gallery, customer reviews, and FAQ sections.",
            "Delivered a mobile-friendly experience with online appointment/contact form and WhatsApp integration."
          ]
        },
        tags: ["Web", "Responsive", "SEO", "UI/UX"]
      }
    ],
    skills: [
      { icon: "⌨️", title: { tr: "Programlama", en: "Programming" }, items: ["Python", "Java", "Go", "Dart", "TypeScript", "JavaScript"] },
      { icon: "🧩", title: { tr: "Frameworkler", en: "Frameworks" }, items: ["Spring Boot", "Flutter", "React", "Next.js", "Node.js", "Electron"] },
      { icon: "🗄️", title: { tr: "Veritabanları", en: "Databases" }, items: ["PostgreSQL", "MySQL", "MSSQL", "Supabase", "Firestore", "SQLite"] },
      { icon: "🏗️", title: { tr: "Mimari", en: "Architecture" }, items: ["REST API", "RBAC", "Multi-Tenant", "Layered Architecture"] },
      { icon: "🛠️", title: { tr: "Araçlar", en: "Tools" }, items: ["Git", "GitHub", "Prisma", "Firebase", "Playwright", "Cloudflare Workers", "Postman", "Vite"] }
    ],
    programs: [
      {
        icon: "🌍", title: { tr: "Aspire Liderlik Programı", en: "Aspire Leadership Program" },
        date: { tr: "Mart 2025", en: "Mar 2025" },
        desc: {
          tr: "40 saatlik küresel liderlik gelişim programını tamamladım; liderlik, iletişim ve sosyal etki odaklı üç modülü bitirdim.",
          en: "Completed the 40-hour global leadership development program, finishing three modules on leadership, communication, and social impact."
        }
      },
      {
        icon: "🚀", title: { tr: "YetGen – 21. Yüzyıl Yetkinlikleri", en: "YetGen – 21st Century Competencies" },
        date: { tr: "Ağu 2023 – Eki 2023", en: "Aug 2023 – Oct 2023" },
        desc: {
          tr: "Analitik düşünme, sunum, liderlik ve teknoloji okuryazarlığı odaklı 140 saatlik ileri seviye eğitimi tamamladım.",
          en: "Completed a 140-hour advanced program focused on analytical thinking, presentation, leadership, and technology literacy."
        },
        verify: {
          tr: "https://verified.sertifier.com/tr/verify/97623904162535/",
          en: "https://verified.sertifier.com/tr/verify/04832158209184/"
        }
      }
    ],
    certifications: [
      { tr: "Oyun ve Uygulama Akademisi – Mezun & Bootcamp Finalisti", en: "Game & Application Academy – Graduate & Bootcamp Finalist" },
      { tr: "IBM x Kodluyoruz – CyberStart Programı", en: "IBM x Kodluyoruz – CyberStart Program" },
      { tr: "Google Project Management Professional Sertifikası", en: "Google Project Management Professional Certificate" },
      { tr: "Miuul – Python ile Veri Bilimi", en: "Miuul – Python for Data Science" },
      { tr: "Cisco – Siber Güvenliğe Giriş", en: "Cisco – Introduction to Cyber Security" }
    ],
    education: {
      school: { tr: "İskenderun Teknik Üniversitesi", en: "Iskenderun Technical University" },
      degree: { tr: "Bilgisayar Mühendisliği, Lisans (2023 – Devam ediyor)", en: "B.Sc. in Computer Engineering (2023 – Present)" }
    },
    languages: [
      { name: { tr: "Türkçe", en: "Turkish" }, level: { tr: "Ana Dil", en: "Native" }, pct: 100 },
      { name: { tr: "İngilizce", en: "English" }, level: "B1", pct: 55 }
    ],
    contact: [
      { icon: "mail", label: { tr: "E-posta", en: "Email" }, value: "ferattas2763@gmail.com", href: "mailto:ferattas2763@gmail.com" },
      { icon: "phone", label: { tr: "Telefon", en: "Phone" }, value: "+90 544 277 5763", href: "tel:+905442775763" },
      { icon: "linkedin", label: "LinkedIn", value: "in/ferattass", href: "https://linkedin.com/in/ferattass" },
      { icon: "github", label: "GitHub", value: "ferattass", href: "https://github.com/ferattass" }
    ]
  };

  const ICONS = {
    mail: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-10 5L2 7"></path></svg>',
    phone: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',
    linkedin: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"></path></svg>',
    github: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.2 3.44 9.6 8.21 11.16.6.11.82-.25.82-.56v-2.1c-3.34.71-4.04-1.4-4.04-1.4-.55-1.36-1.34-1.72-1.34-1.72-1.09-.72.08-.71.08-.71 1.2.08 1.84 1.21 1.84 1.21 1.07 1.78 2.81 1.27 3.5.97.11-.76.42-1.27.76-1.56-2.67-.29-5.47-1.3-5.47-5.79 0-1.28.47-2.32 1.24-3.14-.13-.29-.54-1.48.12-3.09 0 0 1.01-.31 3.3 1.2a11.6 11.6 0 0 1 6 0c2.29-1.51 3.3-1.2 3.3-1.2.66 1.61.25 2.8.12 3.09.78.82 1.24 1.86 1.24 3.14 0 4.5-2.81 5.49-5.49 5.78.43.36.81 1.08.81 2.18v3.23c0 .31.21.68.83.56A12.3 12.3 0 0 0 24 12.29C24 5.78 18.63.5 12 .5z"></path></svg>',
    check: '<svg class="cert-ic" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>',
    verify: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 5v6c0 5 3.4 7.7 8 9 4.6-1.3 8-4 8-9V5l-8-3z"></path><path d="m9 12 2 2 4-4"></path></svg>'
  };

  /* ---------------- Helpers ---------------- */
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const pick = (v, lang) => (v && typeof v === "object" && !Array.isArray(v) ? (v[lang] ?? v.en ?? v.tr) : v);
  const esc = (s) => String(s).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  // Only allow safe schemes for hrefs (blocks javascript:, data:, etc.)
  const safeUrl = (u) => {
    const s = String(u || "").trim();
    return /^(https?:|mailto:|tel:|\/|#)/i.test(s) ? esc(s) : "#";
  };

  let lang = "tr";

  /* ---------------- Renderers ---------------- */
  function renderStats() {
    $("#stats").innerHTML = DATA.stats.map((s) =>
      `<div class="stat"><div class="stat__num">${esc(s.num)}</div><div class="stat__label">${esc(pick(s, lang))}</div></div>`
    ).join("");
  }

  function renderTimeline() {
    $("#timeline").innerHTML = DATA.experience.map((e) => `
      <div class="tl-item reveal">
        <div class="tl-head">
          <div>
            <span class="tl-role">${esc(pick(e.role, lang))}</span>
            <span class="tl-company"> · ${esc(pick(e.company, lang))}</span>
          </div>
          <span class="tl-date">${esc(pick(e.date, lang))}</span>
        </div>
        <ul class="tl-bullets">${pick(e.bullets, lang).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
      </div>`).join("");
  }

  function renderProjects() {
    $("#projects-grid").innerHTML = DATA.projects.map((p) => `
      <article class="project reveal">
        <div class="project__top">
          <div class="project__icon">${p.icon}</div>
          ${p.link
            ? `<a class="project__badge${p.live ? " project__badge--live" : ""}" href="${safeUrl(p.link)}" target="_blank" rel="noopener">${esc(pick(p.badge, lang))}</a>`
            : `<span class="project__badge${p.live ? " project__badge--live" : ""}">${esc(pick(p.badge, lang))}</span>`}
        </div>
        <h3 class="project__name">${esc(pick(p.name, lang))}</h3>
        <p class="project__desc">${esc(pick(p.sub, lang))}</p>
        <ul class="project__bullets">${pick(p.bullets, lang).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
        <div class="project__tags">${p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
        ${p.link ? `<a class="project__link" href="${safeUrl(p.link)}" target="_blank" rel="noopener">${esc(I18N[lang]["projects.live"])}<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M7 7h10v10"></path></svg></a>` : ""}
      </article>`).join("");
  }

  function renderSkills() {
    $("#skills-grid").innerHTML = DATA.skills.map((s) => `
      <div class="skill-card reveal">
        <div class="skill-card__head">
          <div class="skill-card__icon">${s.icon}</div>
          <h3 class="skill-card__title">${esc(pick(s.title, lang))}</h3>
        </div>
        <div class="skill-pills">${s.items.map((i) => `<span class="pill">${esc(i)}</span>`).join("")}</div>
      </div>`).join("");
  }

  function renderPrograms() {
    $("#programs-grid").innerHTML = DATA.programs.map((p) => `
      <div class="program reveal">
        <div class="program__icon">${p.icon}</div>
        <div>
          <h3 class="program__title">${esc(pick(p.title, lang))}</h3>
          <div class="program__date">${esc(pick(p.date, lang))}</div>
          <p class="program__desc">${esc(pick(p.desc, lang))}</p>
          ${p.verify ? `<a class="program__verify" href="${safeUrl(pick(p.verify, lang))}" target="_blank" rel="noopener">${ICONS.verify}${esc(I18N[lang]["programs.verify"])}</a>` : ""}
        </div>
      </div>`).join("");
  }

  function renderCredentials() {
    $("#cert-list").innerHTML = DATA.certifications.map((c) =>
      `<li>${ICONS.check}<span>${esc(pick(c, lang))}</span></li>`).join("")
      + `<li class="cert-verify-row"><a class="cert-verify" href="https://verified.sertifier.com/tr/profile/ferattas2284537" target="_blank" rel="noopener">${ICONS.verify}<span>${esc(I18N[lang]["credentials.verifyAll"])}</span></a></li>`;
    $("#education").innerHTML =
      `<div class="edu__school">${esc(pick(DATA.education.school, lang))}</div>
       <div class="edu__degree">${esc(pick(DATA.education.degree, lang))}</div>`;
    $("#langs").innerHTML = DATA.languages.map((l) => `
      <div class="lang">
        <div class="lang__row"><span class="lang__name">${esc(pick(l.name, lang))}</span><span class="lang__level">${esc(pick(l.level, lang))}</span></div>
        <div class="lang__bar"><div class="lang__fill" data-pct="${l.pct}"></div></div>
      </div>`).join("");
  }

  function renderContact() {
    $("#contact-cards").innerHTML = DATA.contact.map((c) => `
      <a class="cc" href="${safeUrl(c.href)}"${String(c.href).startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>
        <span class="cc__icon">${ICONS[c.icon]}</span>
        <span><span class="cc__label">${esc(pick(c.label, lang))}</span><br><span class="cc__value">${esc(c.value)}</span></span>
      </a>`).join("");
  }

  function renderAll() {
    renderStats(); renderTimeline(); renderProjects(); renderSkills();
    renderPrograms(); renderCredentials(); renderContact();
    observeReveals(); animateLangBars(); initTracingBeam();
  }

  /* ---------------- i18n apply ---------------- */
  function applyI18n() {
    const dict = I18N[lang];
    $$("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!dict[key]) return;
      if (el.tagName === "META") el.setAttribute("content", dict[key]);
      else el.textContent = dict[key];
    });
    document.documentElement.lang = lang;
    document.title = dict["doc.title"] || "Ferat Taş — Software Developer";
    const roleEl = $(".hero__role");
    if (roleEl) roleEl.setAttribute("aria-label", (I18N[lang]["hero.iam"] || "") + " " + TYPED[lang][0]);
    // CV preview link follows the active language
    const prev = $("#cvPreview");
    if (prev) prev.setAttribute("href", lang === "tr" ? "Ferat_Tas_CV_TR.pdf" : "Ferat_Tas_CV_EN.pdf");
    // lang toggle state
    $$(".lang-toggle__btn").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  }

  function setLang(next) {
    lang = next;
    try { localStorage.setItem("lang", next); } catch (e) {}
    applyI18n();
    renderAll();
    restartTyped();
  }

  /* ---------------- Typed effect ---------------- */
  const prefersReduced = () =>
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let typedTimer = null, typedIdx = 0, charIdx = 0, deleting = false;
  function restartTyped() {
    clearTimeout(typedTimer);
    typedIdx = 0; charIdx = 0; deleting = false;
    const el = $("#typed");
    if (prefersReduced()) {
      // No animation: show the primary role statically.
      if (el) el.textContent = TYPED[lang][0];
      const caret = $(".caret");
      if (caret) caret.style.display = "none";
      return;
    }
    typeLoop();
  }
  function typeLoop() {
    const words = TYPED[lang];
    const word = words[typedIdx % words.length];
    const el = $("#typed");
    if (!el) return;
    if (!deleting) {
      el.textContent = word.slice(0, ++charIdx);
      if (charIdx === 1) {
        // announce the freshly-typed role to assistive tech
        const roleEl = $(".hero__role");
        if (roleEl) roleEl.setAttribute("aria-label", (I18N[lang]["hero.iam"] || "") + " " + word);
      }
      if (charIdx === word.length) { deleting = true; typedTimer = setTimeout(typeLoop, 1600); return; }
    } else {
      el.textContent = word.slice(0, --charIdx);
      if (charIdx === 0) { deleting = false; typedIdx++; }
    }
    typedTimer = setTimeout(typeLoop, deleting ? 45 : 90);
  }

  /* ---------------- Scroll reveal ---------------- */
  let revealObserver;
  function observeReveals() {
    if (!("IntersectionObserver" in window)) {
      $$(".reveal").forEach((el) => el.classList.add("is-visible"));
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add("is-visible"); revealObserver.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    }
    $$(".reveal:not(.is-visible)").forEach((el) => revealObserver.observe(el));
  }

  /* ---------------- Tracing beam (timeline) ---------------- */
  let beamItems = [], beamActive = false, beamTicking = false, beamBound = false;

  function updateBeam() {
    beamTicking = false;
    const tl = $("#timeline");
    if (!tl) return;
    const r = tl.getBoundingClientRect();
    const line = window.innerHeight * 0.55; // ekrandaki "okuma çizgisi"
    const p = Math.min(1, Math.max(0, (line - r.top) / Math.max(r.height, 1)));
    tl.style.setProperty("--beam", p.toFixed(4));
    beamItems.forEach((it) => it.classList.toggle("is-lit", it.getBoundingClientRect().top + 14 <= line));
  }

  function queueBeam() {
    if (!beamActive || beamTicking) return;
    beamTicking = true;
    requestAnimationFrame(updateBeam);
  }

  function initTracingBeam() {
    const tl = $("#timeline");
    if (!tl) return;
    beamItems = $$(".tl-item", tl);
    if (prefersReduced() || !("IntersectionObserver" in window)) {
      tl.style.setProperty("--beam", "1");
      beamItems.forEach((it) => it.classList.add("is-lit"));
      return;
    }
    if (!beamBound) {
      beamBound = true;
      // timeline ekran dışındayken scroll dinleyicisi boşa çalışmasın
      new IntersectionObserver((ents) => {
        beamActive = ents[0].isIntersecting;
        if (beamActive) queueBeam();
      }, { rootMargin: "150px 0px" }).observe(tl);
      window.addEventListener("scroll", queueBeam, { passive: true });
      window.addEventListener("resize", queueBeam, { passive: true });
    }
    beamActive = true;
    queueBeam();
  }

  function animateLangBars() {
    setTimeout(() => $$(".lang__fill").forEach((f) => { f.style.width = (f.dataset.pct || 0) + "%"; }), 300);
  }

  /* ---------------- Theme ---------------- */
  function setTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("theme", t); } catch (e) {}
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "dark" ? "#0b0b12" : "#fbfbfd");
  }

  /* ---------------- Contact form ---------------- */
  function initForm() {
    const form = $("#contactForm");
    const note = $("#formNote");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const fd = new FormData(form);
      const name = (fd.get("name") || "").toString().trim();
      const email = (fd.get("email") || "").toString().trim();
      const subject = (fd.get("subject") || "").toString().trim();
      const message = (fd.get("message") || "").toString().trim();
      if (!name || !email || !message) return;

      note.className = "form-note";
      note.textContent = I18N[lang]["contact.form.sending"];

      // Try PHP endpoint first; fall back to mailto if unavailable.
      fetch("contact.php", { method: "POST", body: fd, headers: { "X-Requested-With": "fetch" } })
        .then((r) => (r.ok ? r.json().catch(() => ({ ok: true })) : Promise.reject(r)))
        .then((data) => {
          if (data && data.ok) {
            note.className = "form-note is-ok";
            note.textContent = I18N[lang]["contact.form.okphp"];
            form.reset();
          } else { throw new Error("no"); }
        })
        .catch(() => {
          // Fallback: open user's mail client (works on plain hosting, no backend).
          const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
          const subj = encodeURIComponent(subject || `Portfolio — ${name}`);
          window.location.href = `mailto:ferattas2763@gmail.com?subject=${subj}&body=${body}`;
          note.className = "form-note is-ok";
          note.textContent = I18N[lang]["contact.form.ok"];
          form.reset();
        });
    });
  }

  /* ---------------- Nav / misc interactions ---------------- */
  function initNav() {
    const nav = $("#nav");
    const burger = $("#burger");
    const links = $("#navLinks");
    const progress = $("#scrollProgress");
    const back = $("#backToTop");
    const sections = $$("main section[id]");
    const navLinks = $$(".nav__link");

    function onScroll() {
      const y = window.scrollY;
      nav.classList.toggle("is-scrolled", y > 20);
      back.classList.toggle("is-visible", y > 600);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
      // active link
      let cur = "";
      sections.forEach((sec) => { if (y >= sec.offsetTop - 120) cur = sec.id; });
      navLinks.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === "#" + cur));
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const isMobile = () => window.matchMedia("(max-width: 760px)").matches;
    function setMenu(open) {
      links.classList.toggle("is-open", open);
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
      // keep the off-screen menu out of the tab order on mobile
      if (isMobile() && !open) links.setAttribute("inert", "");
      else links.removeAttribute("inert");
      if (open && isMobile() && navLinks[0]) navLinks[0].focus();
    }
    burger.addEventListener("click", () => setMenu(!links.classList.contains("is-open")));
    navLinks.forEach((l) => l.addEventListener("click", () => {
      const wasOpen = links.classList.contains("is-open");
      setMenu(false);
      if (wasOpen && isMobile()) burger.focus();
    }));
    // Esc closes the menu; resize to desktop clears inert
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && links.classList.contains("is-open")) { setMenu(false); burger.focus(); }
    });
    const mq = window.matchMedia("(max-width: 760px)");
    (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(() => {
      if (!isMobile()) links.removeAttribute("inert");
      else if (!links.classList.contains("is-open")) links.setAttribute("inert", "");
    });
    if (isMobile()) links.setAttribute("inert", "");
    back.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---------------- Content loader (panel-driven) ---------------- */
  async function loadContent() {
    try {
      const r = await fetch("data/content.json", { cache: "no-store" });
      if (!r.ok) return;
      const json = await r.json();
      if (json && typeof json === "object") DATA = json;
    } catch (e) {
      /* file:// or no server — keep embedded fallback */
    }
    mergeSiteTexts();
  }

  /* Overlay editable UI strings (hero / about / headings / contact / footer / seo)
     from content.json onto the I18N + TYPED defaults. Panel-driven; falls back
     to the embedded defaults when a key is missing. */
  function mergeSiteTexts() {
    const setPair = (key, pair) => {
      if (!pair || typeof pair !== "object") return;
      if (typeof pair.tr === "string" && pair.tr.trim()) I18N.tr[key] = pair.tr;
      if (typeof pair.en === "string" && pair.en.trim()) I18N.en[key] = pair.en;
    };
    const h = DATA.hero;
    if (h) {
      setPair("hero.available", h.available); setPair("hero.hi", h.hi); setPair("hero.iam", h.iam);
      setPair("hero.summary", h.summary); setPair("hero.cta.work", h.ctaWork);
      setPair("hero.cta.contact", h.ctaContact); setPair("hero.scroll", h.scroll);
      if (h.roles && Array.isArray(h.roles.tr) && h.roles.tr.length) TYPED.tr = h.roles.tr;
      if (h.roles && Array.isArray(h.roles.en) && h.roles.en.length) TYPED.en = h.roles.en;
    }
    const a = DATA.about;
    if (a) {
      setPair("about.title", a.title); setPair("about.lead", a.lead); setPair("about.body", a.body);
      if (typeof a.photo === "string" && a.photo.trim()) {
        const pImg = document.querySelector(".about__photo img");
        if (pImg) pImg.src = a.photo.trim();
      }
    }
    const hd = DATA.headings;
    if (hd) {
      setPair("experience.title", hd.experience); setPair("projects.title", hd.projects);
      setPair("skills.title", hd.skills); setPair("programs.title", hd.programs);
      setPair("credentials.title", hd.credentials); setPair("credentials.certs", hd.certs);
      setPair("credentials.education", hd.education); setPair("credentials.languages", hd.languages);
    }
    const c = DATA.contactText;
    if (c) { setPair("contact.title", c.title); setPair("contact.heading", c.heading); setPair("contact.text", c.text); }
    const f = DATA.footer;
    if (f) { setPair("footer.role", f.role); setPair("footer.rights", f.rights); }
    const s = DATA.seo;
    if (s) {
      setPair("doc.title", s.title); setPair("meta.description", s.description);
      if (typeof s.googleVerify === "string" && s.googleVerify.trim() &&
          !document.querySelector('meta[name="google-site-verification"]')) {
        const m = document.createElement("meta");
        m.setAttribute("name", "google-site-verification");
        m.setAttribute("content", s.googleVerify.trim());
        document.head.appendChild(m);
      }
    }
  }

  /* ---------------- CV download menu ---------------- */
  function initCvMenu() {
    const menu = $("#cvMenu");
    if (!menu) return;
    const btn = $("#cvDownload");
    const setOpen = (o) => {
      menu.classList.toggle("is-open", o);
      btn.setAttribute("aria-expanded", String(o));
    };
    btn.addEventListener("click", (e) => { e.preventDefault(); setOpen(!menu.classList.contains("is-open")); });
    document.addEventListener("click", (e) => { if (!menu.contains(e.target)) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
    $$(".cv-menu__item", menu).forEach((a) => a.addEventListener("click", () => setOpen(false)));
  }

  /* ---------------- Clean in-page anchors (no #hash in URL) ---------------- */
  function initCleanAnchors() {
    const clean = () => {
      try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
    };
    document.addEventListener("click", (e) => {
      const a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      const href = a.getAttribute("href");
      e.preventDefault();
      if (!href || href === "#" || href === "#hero") {
        window.scrollTo({ top: 0, behavior: prefersReduced() ? "auto" : "smooth" });
        clean();
        return;
      }
      const target = document.querySelector(href);
      if (!target) { clean(); return; }
      target.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth", block: "start" });
      clean();
    });
    // strip any hash present on initial load (e.g. /index.html#hero)
    if (location.hash) clean();
  }

  /* ---------------- Init ---------------- */
  async function init() {
    await loadContent();
    // theme
    let savedTheme;
    try { savedTheme = localStorage.getItem("theme"); } catch (e) {}
    if (!savedTheme) savedTheme = "dark"; // varsayılan koyu tema
    setTheme(savedTheme);
    $("#themeToggle").addEventListener("click", () =>
      setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"));

    // language
    let savedLang;
    try { savedLang = localStorage.getItem("lang"); } catch (e) {}
    if (!savedLang) savedLang = (navigator.language || "tr").toLowerCase().startsWith("tr") ? "tr" : "en";
    lang = savedLang === "en" ? "en" : "tr";

    $$(".lang-toggle__btn").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));

    applyI18n();
    renderAll();
    initNav();
    initForm();
    initCvMenu();
    initCleanAnchors();
    restartTyped();

    $("#year").textContent = new Date().getFullYear();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

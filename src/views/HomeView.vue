<script setup lang="ts">
import { ArrowRight, Search, Users, BookOpen, Calendar, BarChart3, FileText, Settings } from 'lucide-vue-next'
</script>

<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-container">
        <div class="hero-content">
          <h1 class="hero-title">
            Современная платформа для
            <span class="highlight">онлайн-обучения</span>
          </h1>
          <p class="hero-description">
            Удобная система управления образовательным процессом для учителей, учеников и администраторов
          </p>
          <div class="hero-buttons">
            <router-link to="/login" class="btn btn-primary">
              <span>Войти в систему</span>
              <ArrowRight :size="20" />
            </router-link>
            <router-link to="/check-application" class="btn btn-primary">
              <span>Проверить заявку</span>
              <Search :size="20" />
            </router-link>
          </div>
        </div>
        <div class="hero-image">
          <img src="../assets/images/Online learning-bro.svg" alt="Online Learning Illustration" />
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <h2 class="section-title">Возможности платформы</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <Users :size="32" />
            </div>
            <h3>Управление учениками</h3>
            <p>Регистрация, группировка и отслеживание прогресса учащихся</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <BookOpen :size="32" />
            </div>
            <h3>Электронный журнал</h3>
            <p>Ведение посещаемости и оценок в удобном формате</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <Calendar :size="32" />
            </div>
            <h3>Расписание уроков</h3>
            <p>Планирование и организация учебного процесса</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <BarChart3 :size="32" />
            </div>
            <h3>Статистика и отчеты</h3>
            <p>Аналитика успеваемости и посещаемости учащихся</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <FileText :size="32" />
            </div>
            <h3>Задания и тесты</h3>
            <p>Создание и проверка заданий для учеников</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <Settings :size="32" />
            </div>
            <h3>Гибкие настройки</h3>
            <p>Настройка системы под ваши потребности</p>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
  background-attachment: fixed;
}

/* Hero Section */
.hero-section {
  padding: 80px 20px;
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
  /* color: white; */
  min-height: 90vh;
  display: flex;
  align-items: center;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.hero-content {
  animation: fadeInLeft 0.8s ease-out;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 24px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.highlight {
  background: linear-gradient(to right, #a7ff9b, #197b4d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: inline-block;
}

.hero-description {
  font-size: 1.25rem;
  line-height: 1.6;
  margin-bottom: 32px;
  opacity: 0.95;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.btn {
  padding: 14px 32px;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: white;
  color: #667eea;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.btn-secondary {
  background: transparent;
  border: 2px solid;
}

.btn-secondary:hover {
  color: #667eea;
  transform: translateY(-2px);
}

.hero-image {
  animation: fadeInRight 0.8s ease-out;
}

.hero-image img {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
  animation: float 3s ease-in-out infinite;
}

/* Features Section */
.features-section {
  padding: 80px 20px;
  background: white;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 60px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.feature-card {
  padding: 40px 30px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.25);
}

.feature-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.feature-card h3 {
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 12px;
}

.feature-card p {
  color: #718096;
  line-height: 1.6;
}

/* Demo Section */
.demo-section {
  padding: 80px 20px;
  background: #f7fafc;
}

.demo-card {
  max-width: 700px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  padding: 50px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.demo-card h2 {
  font-size: 2rem;
  color: #2d3748;
  margin-bottom: 12px;
}

.demo-subtitle {
  color: #718096;
  font-size: 1.1rem;
  margin-bottom: 32px;
}

.demo-credentials {
  background: #edf2f7;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
}

.credential-item {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 1.1rem;
}

.credential-item:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: 600;
  color: #4a5568;
}

code {
  background: #667eea;
  color: white;
  padding: 6px 16px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 0.95rem;
}

.demo-steps {
  text-align: left;
  margin-bottom: 32px;
}

.demo-steps h3 {
  color: #2d3748;
  margin-bottom: 16px;
}

.demo-steps ol {
  padding-left: 24px;
}

.demo-steps li {
  color: #4a5568;
  margin-bottom: 12px;
  line-height: 1.6;
}

.demo-button {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 48px;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.demo-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

/* Animations */
@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Responsive Design */
@media (max-width: 968px) {
  .hero-container {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-image {
    order: -1;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .demo-card {
    padding: 30px 20px;
  }
}

@media (max-width: 640px) {
  .hero-section {
    padding: 40px 20px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .hero-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .section-title {
    font-size: 1.8rem;
  }
}
</style>

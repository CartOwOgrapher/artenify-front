<template>
  <div class="leaderboard-bg">
    <div class="leaderboard-container">
      <h2 class="title">Таблица лидеров</h2>
      <table class="leaderboard-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Пользователь</th>
            <th>Баллы</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in users" :key="user.id">
            <td>{{ index + 1 }}</td>
            <td class="user-info">
              <img :src="user.avatar" alt="avatar" class="avatar" />
              {{ user.name }}
            </td>
            <td>{{ user.points }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const users = [
  { id: 1, name: 'Анна Иванова', points: 980, avatar: 'https://i.pravatar.cc/40?img=1' },
  { id: 2, name: 'Игорь Смирнов', points: 850, avatar: 'https://i.pravatar.cc/40?img=2' },
  { id: 3, name: 'Елена Котова', points: 790, avatar: 'https://i.pravatar.cc/40?img=3' },
  { id: 4, name: 'Максим Орлов', points: 765, avatar: 'https://i.pravatar.cc/40?img=4' },
  { id: 5, name: 'Татьяна Ли', points: 730, avatar: 'https://i.pravatar.cc/40?img=5' },
]
</script>

<style scoped>
.leaderboard-bg {
  background-color: #fff;
  padding: 60px 0;
  width: 100%;
  position: relative;     /* Нужен для z-index */
  z-index: 13;           /* Выше других контейнеров */
}


.leaderboard-container {
  padding: 40px 20px;
  max-width: 900px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

}

.title {
  text-align: center;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 30px;

}

.leaderboard-table {
  width: 100%;
  border-collapse: collapse;

}

.leaderboard-table th,
.leaderboard-table td {
  text-align: left;
  padding: 15px;
  border-bottom: 1px solid #eaeaea;

}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;

}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

td{
  color: #831283;
  text-shadow: 4px -0.5px 4px #fd05fd;
  font-weight: 500;
}

th{
  color: #831283;
  text-shadow: 4px -0.2px 4px #fd05fd;
  font-weight: 500;
}

h2{
  color: #c000c0;
}
</style>

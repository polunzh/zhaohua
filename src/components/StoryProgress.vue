<script setup lang="ts">
import { computed } from "vue";
import { getStoryDisplayData, type StoryProgressRow } from "../composables/storyDisplayData";

const props = defineProps<{
  storyProgressRows: StoryProgressRow[];
}>();

const displayItems = computed(() => getStoryDisplayData(props.storyProgressRows));
</script>

<template>
  <div class="story-progress" v-if="storyProgressRows.length > 0">
    <div v-for="item in displayItems" :key="item.storyId" class="story-item">
      <div class="story-header">
        <span class="story-name">{{ item.name }}</span>
        <span v-if="item.isFinal" class="story-badge done">完结</span>
        <span v-else class="story-badge"
          >{{ item.currentStageIndex + 1 }}/{{ item.totalStages }}</span
        >
      </div>
      <div class="story-bar-bg">
        <div class="story-bar-fill" :style="{ width: item.progressPercent + '%' }" />
      </div>
      <div class="story-desc">{{ item.description }}</div>
    </div>
  </div>
</template>

<style scoped>
.story-progress {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.story-item {
  background: rgba(180, 160, 120, 0.1);
  border-radius: 6px;
  padding: 8px 10px;
}
.story-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.story-name {
  font-size: 13px;
  font-weight: 600;
  color: #4a4040;
}
.story-badge {
  font-size: 11px;
  color: #8a7a6a;
  background: rgba(180, 160, 120, 0.15);
  padding: 1px 6px;
  border-radius: 8px;
}
.story-badge.done {
  color: #6a8a58;
  background: rgba(106, 138, 88, 0.15);
}
.story-bar-bg {
  height: 4px;
  background: rgba(180, 160, 120, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 6px;
}
.story-bar-fill {
  height: 100%;
  background: #b89860;
  border-radius: 2px;
  transition: width 0.3s ease;
}
.story-desc {
  font-size: 12px;
  color: #6a5a4a;
  line-height: 1.6;
}
</style>

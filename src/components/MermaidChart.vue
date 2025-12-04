<script setup lang="ts">
import { onMounted, ref, watch, nextTick } from 'vue'
import mermaid from 'mermaid'

const props = defineProps<{
  code: string
}>()

const svg = ref('')
const initialized = ref(false)

async function render() {
  if (!initialized.value) {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme: 'default',
      flowchart: {
        htmlLabels: true,
        curve: 'linear'  // Use straight lines instead of curved
      },
      themeVariables: {
        primaryColor: '#ffffff',      // pure white
        primaryTextColor: '#000000',  // pure black for maximum contrast
        primaryBorderColor: '#374151', // gray-700
        lineColor: '#6b7280',         // gray-500
        secondaryColor: '#f3f4f6',    // gray-100
        tertiaryColor: '#f9fafb',     // gray-50
        background: '#ffffff',
        mainBkg: '#ffffff',          // white
        secondBkg: '#f9fafb',        // gray-50
        tertiaryBkg: '#f3f4f6',      // gray-100
        edgeLabelBackground: '#ffffff',
        clusterBkg: '#f9fafb',       // gray-50
        clusterBorder: '#6b7280',    // gray-500
        defaultLinkColor: '#6b7280', // gray-500
        titleColor: '#000000',       // pure black
        fillType0: '#ffffff',        // white
        fillType1: '#f3f4f6',        // gray-100
        fillType2: '#e5e7eb',        // gray-200
        nodeBorder: '#374151',       // gray-700
        nodeTextColor: '#000000',    // black for maximum readability
        sectionBkgColor: '#f9fafb',  // gray-50
        altSectionBkgColor: '#f3f4f6', // gray-100
        gridColor: '#e5e7eb',        // gray-200
        textColor: '#000000',        // black for all text
        labelBackground: '#ffffff',  // white
        labelColor: '#000000',       // black for labels
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
      }
    })
    initialized.value = true
  }

  await nextTick()
  try {
    const { svg: renderedSvg } = await mermaid.render(
      `m-${Date.now()}`,
      props.code.trim()
    )
    svg.value = renderedSvg
  } catch (err) {
    console.error('[Mermaid] render error', err)
    svg.value = `<pre class="text-sm text-red-600">Mermaid parse error. Check diagram syntax.</pre>`
  }
}

onMounted(render)
watch(() => props.code, render)
</script>

<template>
  <div class="mermaid-chart" v-html="svg" />
</template>

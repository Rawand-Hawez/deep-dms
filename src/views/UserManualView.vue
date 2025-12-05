<script setup lang="ts">
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator
} from '@/components/ui'
import { 
  BookOpen, 
  FileText, 
  CheckCircle, 
  Search, 
  ShieldCheck, 
  AlertTriangle,
  PenTool,
  Eye,
  FileCheck
} from 'lucide-vue-next'
</script>

<template>
  <div class="container py-10 max-w-[1200px] mx-auto space-y-10">
    
    <!-- Header -->
    <div class="space-y-4 text-center md:text-left">
      <h1 class="text-4xl font-bold tracking-tight text-slate-900">User Manual</h1>
      <p class="text-xl text-slate-600 max-w-3xl">
        Comprehensive guide to the Deep Manufacturing Document Registry (MDR).
      </p>
    </div>

    <Separator />

    <!-- Introduction -->
    <section class="space-y-4">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-blue-100 rounded-lg">
          <BookOpen class="w-6 h-6 text-blue-700" />
        </div>
        <h2 class="text-2xl font-semibold text-slate-900">1. Introduction</h2>
      </div>
      <Card>
        <CardContent class="pt-6 text-slate-700 space-y-4 leading-relaxed">
          <p>
            Welcome to the <strong>Deep MDR</strong> system. This platform serves as the central repository for all controlled documents within the organisation, ensuring compliance with ISO 9001 and internal quality standards.
          </p>
          <p>
            The system automates the document lifecycle—from drafting and review to approval and publication—ensuring that all employees have access to the correct, approved versions of policies, procedures, and standard operating procedures (SOPs).
          </p>
        </CardContent>
      </Card>
    </section>

    <!-- Roles -->
    <section class="space-y-4">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-purple-100 rounded-lg">
          <ShieldCheck class="w-6 h-6 text-purple-700" />
        </div>
        <h2 class="text-2xl font-semibold text-slate-900">2. Roles & Responsibilities</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <PenTool class="w-5 h-5 text-slate-500" />
              Author
            </CardTitle>
          </CardHeader>
          <CardContent class="text-slate-600 text-sm">
            Responsible for creating new documents and updating existing ones. Authors can draft content, upload source files (Word/Excel), and submit them for approval.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <CheckCircle class="w-5 h-5 text-slate-500" />
              Approver
            </CardTitle>
          </CardHeader>
          <CardContent class="text-slate-600 text-sm">
            Subject Matter Experts (SMEs) or Managers responsible for reviewing the technical content. They can Approve (move to publication queue) or Reject (return to draft) a document.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <FileCheck class="w-5 h-5 text-slate-500" />
              QHSE / Admin
            </CardTitle>
          </CardHeader>
          <CardContent class="text-slate-600 text-sm">
            Quality Health Safety & Environment controllers. They oversee the system, perform the final publication (converting to PDF), and manage document obsolescence.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Eye class="w-5 h-5 text-slate-500" />
              Reader
            </CardTitle>
          </CardHeader>
          <CardContent class="text-slate-600 text-sm">
            General employees. Readers can search, filter, and view <strong>Published</strong> documents only. They cannot see drafts or documents under review.
          </CardContent>
        </Card>
      </div>
    </section>

    <!-- Workflows -->
    <section class="space-y-6">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-green-100 rounded-lg">
          <FileText class="w-6 h-6 text-green-700" />
        </div>
        <h2 class="text-2xl font-semibold text-slate-900">3. Document Lifecycle</h2>
      </div>

      <div class="relative border-l-2 border-slate-200 ml-4 space-y-10 pl-8 py-2">
        <!-- Step 1 -->
        <div class="relative">
          <span class="absolute -left-[41px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 border-2 border-slate-300 text-xs font-bold text-slate-600">1</span>
          <h3 class="text-lg font-medium text-slate-900">Drafting</h3>
          <p class="mt-2 text-slate-600 leading-relaxed">
            Navigate to <strong>My Tasks > New Document</strong>. Fill in the metadata (Title, Type, Department) and upload your source file (.docx or .xlsx). The system will automatically generate a unique <strong>Document Code</strong> (e.g., <code>DPM-HQ-QMS-POL-001</code>).
          </p>
        </div>

        <!-- Step 2 -->
        <div class="relative">
          <span class="absolute -left-[41px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 border-2 border-slate-300 text-xs font-bold text-slate-600">2</span>
          <h3 class="text-lg font-medium text-slate-900">Review & Approval</h3>
          <p class="mt-2 text-slate-600 leading-relaxed">
            Once drafting is complete, click <strong>Request Approval</strong> in the document details. You must specify an <strong>Approver Email</strong>. The designated approver will receive a notification. They can review the source file and click <strong>Approve</strong> to validate the content.
          </p>
        </div>

        <!-- Step 3 -->
        <div class="relative">
          <span class="absolute -left-[41px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 border-2 border-slate-300 text-xs font-bold text-slate-600">3</span>
          <h3 class="text-lg font-medium text-slate-900">Publication</h3>
          <p class="mt-2 text-slate-600 leading-relaxed">
            Approved documents appear in the <strong>Pending Approvals</strong> dashboard for QHSE/Admins. The final step is <strong>Publication</strong>, where the system automatically converts the source document into a secure PDF and makes it available in the <strong>Document Catalogue</strong>.
          </p>
        </div>
      </div>
    </section>

    <!-- Searching -->
    <section class="space-y-4">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-amber-100 rounded-lg">
          <Search class="w-6 h-6 text-amber-700" />
        </div>
        <h2 class="text-2xl font-semibold text-slate-900">4. Finding Documents</h2>
      </div>
      <Card>
        <CardContent class="pt-6 text-slate-700 space-y-4">
          <p>
            The <strong>Document Catalogue</strong> is the homepage for all users.
          </p>
          <ul class="list-disc pl-5 space-y-2">
            <li><strong>Search Bar:</strong> Enter keywords, document codes, or summary text. The search is intelligent and filters in real-time.</li>
            <li><strong>Filters:</strong> Use the dropdown menus to filter by <strong>Document Type</strong> (e.g., Policy, SOP) or <strong>Department</strong>.</li>
            <li><strong>Viewing:</strong> Click the <Eye class="w-4 h-4 inline mx-1 text-slate-400" /> icon to open the PDF directly in your browser.</li>
          </ul>
        </CardContent>
      </Card>
    </section>

    <!-- FAQ -->
    <section class="space-y-4">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-slate-100 rounded-lg">
          <AlertTriangle class="w-6 h-6 text-slate-700" />
        </div>
        <h2 class="text-2xl font-semibold text-slate-900">5. Troubleshooting & FAQ</h2>
      </div>
      <div class="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle class="text-base">I cannot see the "New Document" button.</CardTitle>
          </CardHeader>
          <CardContent class="text-sm text-slate-600">
            Ensure you have <strong>Author</strong> permissions. If you believe this is an error, contact IT Support to request the correct role assignment.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle class="text-base">My document is stuck in "Under Review".</CardTitle>
          </CardHeader>
          <CardContent class="text-sm text-slate-600">
            Check who the assigned Approver is in the Document Details page. You may need to follow up with them directly.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle class="text-base">The PDF conversion failed.</CardTitle>
          </CardHeader>
          <CardContent class="text-sm text-slate-600">
            Ensure your source file is a standard <code>.docx</code> or <code>.xlsx</code> file and is under 25MB. Complex macros or password protection can cause conversion failures.
          </CardContent>
        </Card>
      </div>
    </section>

    <div class="pt-10 text-center text-sm text-slate-400">
      <p>© 2025 Deep Manufacturing. All rights reserved.</p>
    </div>
  </div>
</template>

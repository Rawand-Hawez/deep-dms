<script setup lang="ts">
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  Badge,
  Separator
} from '@/components/ui'

// Icons can be imported if available, otherwise SVG inline.
// Using simple SVG icons inline for now to match the minimal aesthetic and avoid dependency assumptions.
</script>

<template>
  <div class="container py-10 space-y-16 max-w-[1600px] mx-auto">
    
    <!-- Hero Section -->
    <section class="text-center space-y-6 py-10">
      <div class="space-y-4">
        <Badge variant="outline" class="px-4 py-1 text-sm border-slate-300 text-slate-600">
            v1.0 Enterprise Release
        </Badge>
        <h1 class="text-4xl font-bold tracking-tight lg:text-6xl text-slate-900">Deep DMS</h1>
        <div class="flex justify-center gap-2">
          <div class="h-1 w-12 rounded bg-slate-900"></div>
          <div class="h-1 w-8 rounded bg-slate-600"></div>
          <div class="h-1 w-4 rounded bg-slate-400"></div>
        </div>
      </div>
      <p class="mx-auto max-w-3xl text-xl text-slate-600 font-medium leading-relaxed">
        Enterprise-Grade Document Management System that <span class="text-slate-900 font-semibold">transforms your compliance posture</span>, eliminates operational risks, and secures your corporate knowledge.
      </p>
    </section>

    <!-- Executive Summary -->
    <section class="grid gap-8 md:grid-cols-2">
      <!-- Current Reality -->
      <Card class="border-slate-200 shadow-none bg-slate-50/50">
        <CardHeader>
          <div class="space-y-1">
             <div class="text-xs font-bold uppercase tracking-wider text-slate-500">The Current Reality</div>
             <CardTitle class="text-2xl text-slate-700">Manual & Risky</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <p class="text-slate-600 leading-relaxed">
            Relying on Excel trackers and network folders exposes your organization to significant operational blind spots.
          </p>
          <ul class="space-y-3 text-sm text-slate-600">
            <li class="flex gap-3 items-start">
               <span class="text-red-500 mt-0.5">✕</span>
               <span>Fragmented document versions across emails</span>
            </li>
            <li class="flex gap-3 items-start">
               <span class="text-red-500 mt-0.5">✕</span>
               <span>High risk of audit findings and non-compliance</span>
            </li>
            <li class="flex gap-3 items-start">
               <span class="text-red-500 mt-0.5">✕</span>
               <span>Vulnerable to ransomware and data loss</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <!-- Deep Advantage -->
      <Card class="border-slate-900 bg-slate-900 text-slate-50 shadow-lg">
        <CardHeader>
          <div class="space-y-1">
             <div class="text-xs font-bold uppercase tracking-wider text-slate-400">The DMS Advantage</div>
             <CardTitle class="text-2xl text-white">Automated & Secure</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <p class="text-slate-300 leading-relaxed">
            Deep DMS centralizes control with a modern, ISO-compliant platform that secures your knowledge.
          </p>
          <ul class="space-y-3 text-sm text-slate-300">
            <li class="flex gap-3 items-start">
               <span class="text-emerald-400 mt-0.5">✓</span>
               <span>Single source of truth with auto-versioning</span>
            </li>
            <li class="flex gap-3 items-start">
               <span class="text-emerald-400 mt-0.5">✓</span>
               <span>Audit-ready history and 100% traceability</span>
            </li>
            <li class="flex gap-3 items-start">
               <span class="text-emerald-400 mt-0.5">✓</span>
               <span>Enterprise-grade security via Microsoft 365</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </section>

    <!-- The Cost of Inaction -->
    <section class="space-y-8">
      <div class="flex items-center justify-between">
         <h2 class="text-3xl font-bold tracking-tight text-slate-900">The Cost of Inaction</h2>
         <Separator class="hidden md:block w-1/3 bg-slate-200" />
      </div>
      
      <div class="grid gap-6 md:grid-cols-2">
        <Card class="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle class="text-lg">Compliance Violations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul class="list-disc list-inside space-y-2 text-slate-600 text-sm">
              <li>ISO 9001 audit failures due to uncontrolled changes</li>
              <li>API Q1 compliance gaps in traceability</li>
              <li>No single source of truth for procedures</li>
              <li>Risk of certification loss</li>
            </ul>
          </CardContent>
        </Card>

        <Card class="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle class="text-lg">Cybersecurity Vulnerabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul class="list-disc list-inside space-y-2 text-slate-600 text-sm">
              <li>Uncontrolled network drives vulnerable to ransomware</li>
              <li>No access logging or audit trails</li>
              <li>Unlimited user access risks</li>
              <li>No encryption on sensitive documents</li>
            </ul>
          </CardContent>
        </Card>

        <Card class="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle class="text-lg">Operational Inefficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <ul class="list-disc list-inside space-y-2 text-slate-600 text-sm">
              <li>Errors from outdated procedures</li>
              <li>Wasted hours searching for versions</li>
              <li>Manual approval bottlenecks</li>
              <li>Production delays</li>
            </ul>
          </CardContent>
        </Card>

        <Card class="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle class="text-lg">Business Continuity Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <ul class="list-disc list-inside space-y-2 text-slate-600 text-sm">
              <li>No disaster recovery for documentation</li>
              <li>Single points of failure</li>
              <li>Insider threat vulnerabilities</li>
              <li>Inability to prove integrity</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>

    <!-- Security & Compliance -->
    <section class="space-y-8">
      <div class="flex items-center gap-4">
          <h2 class="text-3xl font-bold tracking-tight text-slate-900">Enterprise-Grade Security</h2>
           <Separator class="flex-1 bg-slate-200" />
      </div>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <!-- MS365 -->
        <Card class="bg-slate-50/50 border-slate-200">
          <CardHeader>
            <CardTitle class="text-base">Microsoft 365 Integration</CardTitle>
          </CardHeader>
          <CardContent class="text-sm text-slate-600 space-y-3">
            <p><strong>MSAL Authentication:</strong> SSO with Microsoft accounts.</p>
            <Separator />
            <p><strong>Azure AD:</strong> Seamless ecosystem integration.</p>
            <Separator />
            <p><strong>Conditional Access:</strong> Policy enforcement.</p>
          </CardContent>
        </Card>

        <!-- Zero-Trust -->
        <Card class="bg-slate-50/50 border-slate-200">
          <CardHeader>
            <CardTitle class="text-base">Zero-Trust Architecture</CardTitle>
          </CardHeader>
          <CardContent class="text-sm text-slate-600 space-y-3">
            <p><strong>Azure AD:</strong> Enterprise SSO.</p>
            <Separator />
            <p><strong>Least Privilege:</strong> Scoped visibility.</p>
            <Separator />
            <p><strong>Encrypted:</strong> AES-256 & TLS 1.2+.</p>
          </CardContent>
        </Card>

        <!-- ISO 9001 -->
        <Card class="bg-slate-50/50 border-slate-200">
          <CardHeader>
            <CardTitle class="text-base">ISO 9001:2015 Compliance</CardTitle>
          </CardHeader>
          <CardContent class="text-sm text-slate-600 space-y-3">
            <p><strong>Lifecycle:</strong> Draft → Publish → Archive.</p>
            <Separator />
            <p><strong>Traceability:</strong> Full audit trail.</p>
            <Separator />
            <p><strong>Version Control:</strong> Auto-revision tracking.</p>
          </CardContent>
        </Card>

        <!-- API Q1 -->
        <Card class="bg-slate-50/50 border-slate-200">
          <CardHeader>
            <CardTitle class="text-base">API Q1 Alignment</CardTitle>
          </CardHeader>
          <CardContent class="text-sm text-slate-600 space-y-3">
             <p><strong>Document Control:</strong> Procedure management.</p>
             <Separator />
             <p><strong>Process Docs:</strong> SOPs and instructions.</p>
             <Separator />
             <p><strong>Audit Readiness:</strong> Instant reports.</p>
          </CardContent>
        </Card>

         <!-- Data Protection -->
         <Card class="bg-slate-50/50 border-slate-200 lg:col-span-2">
          <CardHeader>
            <CardTitle class="text-base">Data Protection & Privacy</CardTitle>
          </CardHeader>
          <CardContent class="text-sm text-slate-600 grid md:grid-cols-2 gap-8">
             <div class="space-y-3">
                <p><strong>Microsoft 365:</strong> ISO 27001, SOC 1/2/3.</p>
                <Separator />
                <p><strong>GDPR:</strong> Full privacy controls.</p>
             </div>
             <div class="space-y-3">
                <p><strong>Data Residency:</strong> Sovereignty control.</p>
                <Separator />
                <p><strong>Backups:</strong> Continuous protection.</p>
             </div>
          </CardContent>
        </Card>
      </div>
    </section>

    <!-- Benefits Stats -->
    <section>
        <Card class="bg-slate-900 text-slate-50 border-slate-800 overflow-hidden">
            <CardHeader class="pb-2">
                <CardTitle class="text-2xl text-slate-50">Quantifiable Business Benefits</CardTitle>
            </CardHeader>
            <CardContent>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-8 py-6">
                    <div class="text-center space-y-2">
                        <div class="text-4xl font-bold">99.9%</div>
                        <Separator class="bg-slate-700 w-1/2 mx-auto" />
                        <div class="text-xs text-slate-400 font-medium uppercase tracking-wider">Uptime Guarantee</div>
                    </div>
                    <div class="text-center space-y-2">
                        <div class="text-4xl font-bold">75%</div>
                        <Separator class="bg-slate-700 w-1/2 mx-auto" />
                        <div class="text-xs text-slate-400 font-medium uppercase tracking-wider">Faster Approvals</div>
                    </div>
                    <div class="text-center space-y-2">
                        <div class="text-4xl font-bold">100%</div>
                         <Separator class="bg-slate-700 w-1/2 mx-auto" />
                        <div class="text-xs text-slate-400 font-medium uppercase tracking-wider">Traceability</div>
                    </div>
                    <div class="text-center space-y-2">
                        <div class="text-4xl font-bold">Zero</div>
                         <Separator class="bg-slate-700 w-1/2 mx-auto" />
                        <div class="text-xs text-slate-400 font-medium uppercase tracking-wider">Ransomware Risk</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    </section>

    <!-- Roadmap -->
    <section class="space-y-8">
        <h2 class="text-3xl font-bold tracking-tight text-slate-900">Implementation Roadmap</h2>
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            <Card class="border-slate-200 relative overflow-hidden group hover:border-slate-300 transition-colors">
                <div class="absolute top-0 left-0 w-full h-1 bg-slate-800"></div>
                <CardHeader>
                    <div class="text-4xl font-bold text-slate-200 mb-2 group-hover:text-slate-300 transition-colors">01</div>
                    <CardTitle class="text-sm">Analysis & Planning</CardTitle>
                    <CardDescription>1-2 Weeks</CardDescription>
                </CardHeader>
                <CardContent class="text-xs text-slate-600">
                    Mapping workflows, requirements, and security config.
                </CardContent>
            </Card>

            <Card class="border-slate-200 relative overflow-hidden group hover:border-slate-300 transition-colors">
                <div class="absolute top-0 left-0 w-full h-1 bg-slate-700"></div>
                 <CardHeader>
                    <div class="text-4xl font-bold text-slate-200 mb-2 group-hover:text-slate-300 transition-colors">02</div>
                    <CardTitle class="text-sm">Architecture & Setup</CardTitle>
                    <CardDescription>2 Weeks</CardDescription>
                </CardHeader>
                <CardContent class="text-xs text-slate-600">
                    SharePoint, App Skeleton, MSAL, Policies.
                </CardContent>
            </Card>

            <Card class="border-slate-200 relative overflow-hidden group hover:border-slate-300 transition-colors">
                <div class="absolute top-0 left-0 w-full h-1 bg-slate-600"></div>
                 <CardHeader>
                    <div class="text-4xl font-bold text-slate-200 mb-2 group-hover:text-slate-300 transition-colors">03</div>
                    <CardTitle class="text-sm">Core Development</CardTitle>
                    <CardDescription>4-6 Weeks</CardDescription>
                </CardHeader>
                <CardContent class="text-xs text-slate-600">
                    UI, Workflows, RBAC, API Integration.
                </CardContent>
            </Card>

            <Card class="border-slate-200 relative overflow-hidden group hover:border-slate-300 transition-colors">
                <div class="absolute top-0 left-0 w-full h-1 bg-slate-500"></div>
                 <CardHeader>
                    <div class="text-4xl font-bold text-slate-200 mb-2 group-hover:text-slate-300 transition-colors">04</div>
                    <CardTitle class="text-sm">Testing & Training</CardTitle>
                    <CardDescription>2 Weeks</CardDescription>
                </CardHeader>
                <CardContent class="text-xs text-slate-600">
                    UAT, Security Audits, Staff Training.
                </CardContent>
            </Card>

            <Card class="border-slate-200 relative overflow-hidden group hover:border-slate-300 transition-colors">
                <div class="absolute top-0 left-0 w-full h-1 bg-slate-400"></div>
                 <CardHeader>
                    <div class="text-4xl font-bold text-slate-200 mb-2 group-hover:text-slate-300 transition-colors">05</div>
                    <CardTitle class="text-sm">Go-Live</CardTitle>
                    <CardDescription>1 Week</CardDescription>
                </CardHeader>
                <CardContent class="text-xs text-slate-600">
                    Migration, Cutover, Validation.
                </CardContent>
            </Card>
        </div>
    </section>

    <!-- Technical Architecture & Usability (Combined Grid) -->
    <section class="grid gap-6 md:grid-cols-2">
        <Card class="h-full border-slate-200">
            <CardHeader>
                <CardTitle>Modern Architecture</CardTitle>
            </CardHeader>
            <CardContent class="space-y-6">
                <div class="flex gap-4 items-start">
                    <Badge variant="secondary" class="h-8 w-8 rounded flex items-center justify-center shrink-0 p-0">FE</Badge>
                    <div>
                        <h4 class="font-semibold text-sm">Frontend Layer</h4>
                        <p class="text-sm text-slate-600 mt-1">Vue.js 3, TypeScript, MSAL SSO.</p>
                    </div>
                </div>
                <Separator />
                <div class="flex gap-4 items-start">
                    <Badge variant="secondary" class="h-8 w-8 rounded flex items-center justify-center shrink-0 p-0">API</Badge>
                    <div>
                        <h4 class="font-semibold text-sm">API Layer</h4>
                        <p class="text-sm text-slate-600 mt-1">Node.js/.NET, Workflow Automation.</p>
                    </div>
                </div>
                <Separator />
                <div class="flex gap-4 items-start">
                    <Badge variant="secondary" class="h-8 w-8 rounded flex items-center justify-center shrink-0 p-0">DB</Badge>
                    <div>
                        <h4 class="font-semibold text-sm">Data Layer</h4>
                        <p class="text-sm text-slate-600 mt-1">SharePoint Online, Secure Storage.</p>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card class="h-full border-slate-200">
            <CardHeader>
                <CardTitle>User Adoption</CardTitle>
            </CardHeader>
            <CardContent class="space-y-6">
                 <div class="space-y-2">
                    <h4 class="font-semibold text-sm">Intuitive Interface</h4>
                    <p class="text-sm text-slate-600">Clean design, role-based dashboards, smart search, and mobile-responsive.</p>
                 </div>
                 <Separator />
                 <div class="space-y-2">
                    <h4 class="font-semibold text-sm">Minimal Training</h4>
                    <p class="text-sm text-slate-600">Familiar M365 feel, guided workflows, email notifications.</p>
                 </div>
                 <Separator />
                 <div class="space-y-2">
                    <h4 class="font-semibold text-sm">Future Ready</h4>
                    <p class="text-sm text-slate-600">AI-ready for search/summarization, scalable cloud-native design.</p>
                 </div>
            </CardContent>
        </Card>
    </section>

    <!-- Support & Ownership -->
    <section class="space-y-8">
        <div class="flex items-center gap-4">
             <h2 class="text-3xl font-bold tracking-tight text-slate-900">Support & Ownership</h2>
             <Separator class="flex-1 bg-slate-200" />
        </div>
       
        <div class="grid gap-6 md:grid-cols-2">
            <Card class="bg-slate-50 border-slate-200">
                <CardHeader>
                    <CardTitle>6-Month Support Guarantee</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul class="space-y-2 text-sm text-slate-600">
                        <li class="flex gap-2 items-center"><Badge variant="default" class="h-5 w-12 justify-center">24/7</Badge> Technical Support</li>
                        <li class="flex gap-2 items-center"><Badge variant="default" class="h-5 w-12 justify-center">4hr</Badge> Critical Response Time</li>
                        <li class="flex gap-2 items-center"><Badge variant="default" class="h-5 w-12 justify-center">Free</Badge> Bug Fixes</li>
                        <li class="flex gap-2 items-center"><Badge variant="default" class="h-5 w-12 justify-center">Live</Badge> Performance Optimization</li>
                    </ul>
                </CardContent>
            </Card>

            <Card class="bg-slate-50 border-slate-200">
                <CardHeader>
                    <CardTitle>Complete Ownership</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul class="space-y-2 text-sm text-slate-600">
                        <li class="flex gap-2 items-center"><Badge variant="outline" class="h-5 w-12 justify-center border-slate-400">100%</Badge> Source Code Ownership</li>
                        <li class="flex gap-2 items-center"><Badge variant="outline" class="h-5 w-12 justify-center border-slate-400">No</Badge> Recurring License Fees</li>
                        <li class="flex gap-2 items-center"><Badge variant="outline" class="h-5 w-12 justify-center border-slate-400">Full</Badge> Customization Rights</li>
                        <li class="flex gap-2 items-center"><Badge variant="outline" class="h-5 w-12 justify-center border-slate-400">Total</Badge> Vendor Independence</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
        
        <Card class="bg-slate-900 text-slate-50 border-slate-800">
            <CardHeader>
                <div class="flex items-center justify-between">
                    <CardTitle class="text-white">IT Department Empowerment</CardTitle>
                    <Badge variant="secondary" class="bg-slate-700 text-slate-200 hover:bg-slate-600">Included</Badge>
                </div>
                <CardDescription class="text-slate-400">We ensure your IT department becomes self-sufficient.</CardDescription>
            </CardHeader>
            <CardContent>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                     <div class="p-4 rounded bg-slate-800/50 border border-slate-800">
                        <div class="text-xl font-bold">3-Day</div>
                        <div class="text-sm text-slate-400">Technical Training</div>
                     </div>
                     <div class="p-4 rounded bg-slate-800/50 border border-slate-800">
                        <div class="text-xl font-bold">24/7</div>
                        <div class="text-sm text-slate-400">Docs Access</div>
                     </div>
                     <div class="p-4 rounded bg-slate-800/50 border border-slate-800">
                        <div class="text-xl font-bold">100%</div>
                        <div class="text-sm text-slate-400">Code Transfer</div>
                     </div>
                </div>
            </CardContent>
        </Card>
    </section>

    <!-- CTA -->
    <section class="text-center py-10">
        <h2 class="text-3xl font-bold text-slate-900 mb-4">Ready to Transform?</h2>
        <p class="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Deep DMS eliminates compliance risks and strengthens cybersecurity. Join industry leaders who have chosen a modern, secure approach.
        </p>
    </section>

  </div>
</template>

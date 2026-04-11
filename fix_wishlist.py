import re

content = open('wishlist.html', encoding='utf-8').read()

card_amount_template = '''
                        <!-- Amount & Deadline Row -->
                        <div class="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-4 pb-4 border-b border-surface-soft/40">
                            <div class="flex items-center gap-2">
                                <svg class="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 8h6M9 12h6M9 8c2.21 0 4 1.79 4 4s-1.79 4-4 4H9l5 4" />
                                </svg>
                                <span class="text-sm sm:text-base font-medium">₹10,000/year</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <svg class="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span class="text-sm sm:text-base font-medium">31 Oct 2026</span>
                            </div>
                        </div>

                        <!-- Category Tags -->
                        <div class="flex flex-wrap gap-2 mb-4">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">SC Students</span>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">Post-Matric</span>
                        </div>
'''

new_content = re.sub(r'(<p class="text-text-secondary[^>]*>.*?</p>)', r'\1\n' + card_amount_template, content, count=2, flags=re.DOTALL)

open('wishlist.html', 'w', encoding='utf-8').write(new_content)

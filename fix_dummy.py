import re

content = open('js/dummyData.js', encoding='utf-8').read()

mocks = [
    { 'amount': '₹10,000/year', 'deadline': '31 Oct 2026', 'tags': ['SC Students', 'Post-Matric'] },
    { 'amount': '₹2000/month', 'deadline': '15 Nov 2026', 'tags': ['Punjab', 'Merit', 'Undergraduate'] },
    { 'amount': '₹20,000/year', 'deadline': '30 Dec 2026', 'tags': ['All India', 'Low Income'] },
    { 'amount': '₹5,000/year', 'deadline': '12 Sep 2026', 'tags': ['OBC', 'Pre-Matric'] },
    { 'amount': '₹50,000/year', 'deadline': '25 Jan 2027', 'tags': ['Girls Only', 'AICTE'] },
    { 'amount': '₹51,000 one-time', 'deadline': 'Rolling', 'tags': ['Punjab', 'SC', 'Marriage'] }
]

def repl(m):
    idx = getattr(repl, 'idx', 0)
    mock = mocks[idx % len(mocks)]
    repl.idx = idx + 1
    tags_str = '["' + '", "'.join(mock['tags']) + '"]'
    return f'{m.group(1)}\n            amount: "{mock["amount"]}",\n            deadline: "{mock["deadline"]}",\n            tags: {tags_str},'

new_content = re.sub(r'(apply_link:\s*\x22[^\x22]*\x22,)', repl, content)

open('js/dummyData.js', 'w', encoding='utf-8').write(new_content)

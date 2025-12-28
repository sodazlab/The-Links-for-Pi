export type LanguageCode = 'en' | 'kr' | 'cn' | 'jp' | 'hi' | 'es' | 'vi' | 'tl';

export const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: 'en', label: 'EN' }, // English
  { code: 'kr', label: 'KR' }, // Korean
  { code: 'cn', label: 'CN' }, // Chinese (Simplified)
  { code: 'jp', label: 'JP' }, // Japanese
  { code: 'hi', label: 'HI' }, // Hindi
  { code: 'es', label: 'ES' }, // Spanish
  { code: 'vi', label: 'VI' }, // Vietnamese
  { code: 'tl', label: 'TL' }, // Filipino (Tagalog)
];

export const TRANSLATIONS = {
  en: {
    nav: {
      discover: 'Discover',
      connect: 'Connect Wallet',
      admin: 'Moderation',
    },
    home: {
      weekly_best: 'Weekly Best',
      hall_of_fame: 'Hall of Fame',
      fresh_feeds: 'Fresh Feeds',
      view_all: 'VIEW ALL',
      load_more: 'Load More',
      no_posts: 'No posts found',
      no_posts_desc: 'There are no posts in this category yet.',
      clear_filter: 'Clear Filter',
      cats: {
        all: 'All',
        article: 'Articles',
        other: 'Other'
      }
    },
    submit: {
      title_new: 'Submit Link',
      title_edit: 'Edit Link',
      subtitle: 'Share with the Pi Community',
      fee: 'Fee: 1 Pi',
      link_url: 'Link URL',
      category: 'Category',
      post_lang: 'Post Language',
      post_title: 'Title',
      description: 'Description',
      btn_processing: 'Processing...',
      btn_update: 'Update Link',
      btn_pay: 'Pay 1 Pi & Submit',
      auth_required: 'Authentication Required',
      auth_desc: 'Please connect your wallet to submit or edit links.',
      return_home: 'Return to Home',
      ph_title: 'Enter a catchy title',
      ph_desc: 'What is this link about?',
      warn_imp: 'Important:',
      warn_text: 'Read the Submission Policy below. Invalid posts are rejected without refund.',
      policy_title: 'Submission Policy',
      policy_spam: 'Anti-Spam Fee: A fee of 1 Pi is required for every submission to maintain high-quality content and prevent spam.',
      policy_admin: 'Admin Approval: Your post will not appear immediately. It will be published only after passing a manual review.',
      policy_content: 'Content Quality: Links must be helpful to Pioneers and relevant to Pi Network. Promotional/scam content will be deleted.',
      policy_refund: 'NO REFUNDS: If your post is rejected due to violation of these guidelines, the 1 Pi fee will NOT be refunded.'
    },
    card: {
      delete_confirm: 'Are you sure?',
      delete_msg: 'This link will be permanently removed.',
      delete_btn: 'Delete Now',
      login_req: 'Please connect your Pi wallet to interact.',
      share_title: 'Share Link',
      share_copied: 'Link copied to clipboard!',
    }
  },
  kr: {
    nav: {
      discover: '탐색',
      connect: '지갑 연결',
      admin: '운영 관리',
    },
    home: {
      weekly_best: '주간 베스트',
      hall_of_fame: '명예의 전당',
      fresh_feeds: '최신 피드',
      view_all: '모두 보기',
      load_more: '더 보기',
      no_posts: '게시물이 없습니다',
      no_posts_desc: '이 카테고리에는 아직 게시물이 없습니다.',
      clear_filter: '필터 초기화',
      cats: {
        all: '전체',
        article: '아티클',
        other: '기타'
      }
    },
    submit: {
      title_new: '링크 제출',
      title_edit: '링크 수정',
      subtitle: '파이 커뮤니티와 공유하세요',
      fee: '수수료: 1 Pi',
      link_url: '링크 URL',
      category: '카테고리',
      post_lang: '게시물 언어',
      post_title: '제목',
      description: '설명',
      btn_processing: '처리 중...',
      btn_update: '링크 수정',
      btn_pay: '1 Pi 결제 및 제출',
      auth_required: '인증 필요',
      auth_desc: '링크를 제출하려면 지갑을 연결하세요.',
      return_home: '홈으로',
      ph_title: '매력적인 제목을 입력하세요',
      ph_desc: '이 링크에 대한 설명을 적어주세요.',
      warn_imp: '중요:',
      warn_text: '제출 정책을 반드시 숙지하세요. 부적절한 게시물은 환불 없이 삭제됩니다.',
      policy_title: '제출 정책',
      policy_spam: '스팸 방지 수수료: 고품질 콘텐츠 유지를 위해 모든 제출물에는 1 Pi의 수수료가 부과됩니다.',
      policy_admin: '관리자 승인: 제출된 포스트는 즉시 게시되지 않으며, 수동 검토를 거친 후 승인됩니다.',
      policy_content: '콘텐츠 품질: 파이 네트워크와 관련이 있거나 개척자들에게 도움이 되는 링크여야 합니다.',
      policy_refund: '환불 불가: 가이드라인 위반으로 게시가 거절된 경우, 지불한 1 Pi는 환불되지 않습니다.'
    },
    card: {
      delete_confirm: '정말 삭제하시겠습니까?',
      delete_msg: '이 링크는 영구적으로 삭제됩니다.',
      delete_btn: '삭제하기',
      login_req: '상호작용을 위해 파이 지갑을 연결해 주세요.',
      share_title: '공유하기',
      share_copied: '링크가 클립보드에 복사되었습니다!',
    }
  }
};
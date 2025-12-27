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
      admin: 'Moderation', // Keep English for Admin
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
      
      // Warning Banner
      warn_imp: 'Important:',
      warn_text: 'Read the Submission Policy below. Invalid posts are rejected without refund.',
      
      // Policy
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
    }
  },
  kr: {
    nav: {
      discover: '탐색',
      connect: '지갑 연결',
      admin: 'Moderation',
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
      warn_text: '하단의 제출 정책을 반드시 확인하세요. 부적합한 게시물은 환불 없이 삭제됩니다.',
      policy_title: '제출 정책',
      policy_spam: '스팸 방지: 고품질 콘텐츠 유지를 위해 게시물 작성 시 1 Pi가 부과됩니다.',
      policy_admin: '관리자 승인: 제출된 링크는 관리자의 검토를 거친 후 최종 게시됩니다.',
      policy_content: '콘텐츠 품질: 파이 네트워크와 관련되고 유익한 정보여야 합니다. 단순 홍보나 스팸은 삭제됩니다.',
      policy_refund: '환불 불가: 가이드라인 위반으로 거절될 경우 1 Pi는 반환되지 않습니다.'
    },
    card: {
      delete_confirm: '정말 삭제하시겠습니까?',
      delete_msg: '이 링크는 영구적으로 삭제됩니다.',
      delete_btn: '지금 삭제',
      login_req: '커뮤니티 활동을 위해 지갑을 연결해주세요.',
    }
  },
  cn: {
    nav: {
      discover: '发现',
      connect: '连接钱包',
      admin: 'Moderation',
    },
    home: {
      weekly_best: '本周最佳',
      hall_of_fame: '名人堂',
      fresh_feeds: '最新动态',
      view_all: '查看全部',
      load_more: '加载更多',
      no_posts: '未找到帖子',
      no_posts_desc: '该分类下暂无内容。',
      clear_filter: '清除筛选',
      cats: {
        all: '全部',
        article: '文章',
        other: '其他'
      }
    },
    submit: {
      title_new: '提交链接',
      title_edit: '编辑链接',
      subtitle: '分享给 Pi 社区',
      fee: '费用: 1 Pi',
      link_url: '链接 URL',
      category: '分类',
      post_title: '标题',
      description: '描述',
      btn_processing: '处理中...',
      btn_update: '更新链接',
      btn_pay: '支付 1 Pi 并提交',
      auth_required: '需要验证',
      auth_desc: '请连接钱包以提交或编辑链接。',
      return_home: '返回首页',
      ph_title: '输入一个吸引人的标题',
      ph_desc: '这个链接是关于什么的？',
      warn_imp: '重要:',
      warn_text: '请阅读下方的提交政策。违规帖子将被拒绝且不退款。',
      policy_title: '提交政策',
      policy_spam: '反垃圾费用：每次提交需支付 1 Pi，以防止垃圾内容。',
      policy_admin: '管理员批准：您的帖子需经人工审核通过后才会显示。',
      policy_content: '内容质量：链接必须与 Pi Network 相关且有用。推广或诈骗内容将被删除。',
      policy_refund: '无退款：若因违反准则被拒绝，1 Pi 费用将不予退还。'
    },
    card: {
      delete_confirm: '确定删除？',
      delete_msg: '此链接将被永久删除。',
      delete_btn: '立即删除',
      login_req: '请连接 Pi 钱包以进行互动。',
    }
  },
  jp: {
    nav: {
      discover: '探す',
      connect: '接続',
      admin: 'Moderation',
    },
    home: {
      weekly_best: '週間ベスト',
      hall_of_fame: '殿堂入り',
      fresh_feeds: '最新フィード',
      view_all: 'すべて見る',
      load_more: 'もっと見る',
      no_posts: '投稿が見つかりません',
      no_posts_desc: 'このカテゴリにはまだ投稿がありません。',
      clear_filter: 'フィルタ解除',
      cats: {
        all: 'すべて',
        article: '記事',
        other: 'その他'
      }
    },
    submit: {
      title_new: 'リンク投稿',
      title_edit: 'リンク編集',
      subtitle: 'Piコミュニティと共有',
      fee: '手数料: 1 Pi',
      link_url: 'リンクURL',
      category: 'カテゴリ',
      post_title: 'タイトル',
      description: '説明',
      btn_processing: '処理中...',
      btn_update: '更新する',
      btn_pay: '1 Pi 支払って投稿',
      auth_required: '認証が必要です',
      auth_desc: '投稿するにはウォレットを接続してください。',
      return_home: 'ホームへ戻る',
      ph_title: '魅力的なタイトルを入力',
      ph_desc: 'このリンクの内容は？',
      warn_imp: '重要:',
      warn_text: '下の投稿ポリシーを必ず確認してください。違反した投稿は返金なしで削除されます。',
      policy_title: '投稿ポリシー',
      policy_spam: 'スパム防止: 品質の維持とスパム防止のため、投稿ごとに1 Piが必要です。',
      policy_admin: '管理者承認: 投稿は管理者の審査を通過した後に公開されます。',
      policy_content: 'コンテンツ品質: Pi Networkに関連し、役立つ情報である必要があります。宣伝や詐欺は削除されます。',
      policy_refund: '返金なし: ガイドライン違反で拒否された場合、1 Piは返金されません。'
    },
    card: {
      delete_confirm: '削除しますか？',
      delete_msg: 'このリンクは完全に削除されます。',
      delete_btn: '削除する',
      login_req: '操作するにはPiウォレットを接続してください。',
    }
  },
  hi: {
    nav: {
      discover: 'खोजें',
      connect: 'वॉलेट जोड़ें',
      admin: 'Moderation',
    },
    home: {
      weekly_best: 'साप्ताहिक सर्वश्रेष्ठ',
      hall_of_fame: 'हॉल ऑफ फेम',
      fresh_feeds: 'ताज़ा फीड',
      view_all: 'सभी देखें',
      load_more: 'और लोड करें',
      no_posts: 'कोई पोस्ट नहीं मिली',
      no_posts_desc: 'इस श्रेणी में अभी कोई पोस्ट नहीं है।',
      clear_filter: 'फ़िल्टर साफ़ करें',
      cats: {
        all: 'सभी',
        article: 'लेख',
        other: 'अन्य'
      }
    },
    submit: {
      title_new: 'लिंक जमा करें',
      title_edit: 'लिंक संपादित करें',
      subtitle: 'Pi समुदाय के साथ साझा करें',
      fee: 'शुल्क: 1 Pi',
      link_url: 'लिंक URL',
      category: 'श्रेणी',
      post_title: 'शीर्षक',
      description: 'विवरण',
      btn_processing: 'प्रक्रिया जारी है...',
      btn_update: 'लिंक अपडेट करें',
      btn_pay: '1 Pi भुगतान करें और जमा करें',
      auth_required: 'प्रमाणीकरण आवश्यक',
      auth_desc: 'लिंक जमा करने के लिए कृपया अपना वॉलेट कनेक्ट करें।',
      return_home: 'होम पर लौटें',
      ph_title: 'एक आकर्षक शीर्षक दर्ज करें',
      ph_desc: 'यह लिंक किस बारे में है?',
      warn_imp: 'महत्वपूर्ण:',
      warn_text: 'नीचे दी गई जमा नीति पढ़ें। अमान्य पोस्ट बिना रिफंड के अस्वीकार कर दी जाएंगी।',
      policy_title: 'जमा करने की नीति',
      policy_spam: 'स्पैम रोकथाम: स्पैम को रोकने के लिए प्रत्येक सबमिशन के लिए 1 Pi का शुल्क आवश्यक है।',
      policy_admin: 'एडमिन स्वीकृति: आपकी पोस्ट समीक्षा के बाद ही प्रकाशित की जाएगी।',
      policy_content: 'सामग्री गुणवत्ता: लिंक Pi Network से संबंधित और उपयोगी होने चाहिए। प्रचार/घोटाले हटा दिए जाएंगे।',
      policy_refund: 'कोई रिफंड नहीं: यदि नियमों के उल्लंघन के कारण पोस्ट अस्वीकार की जाती है, तो 1 Pi वापस नहीं किया जाएगा।'
    },
    card: {
      delete_confirm: 'क्या आप निश्चित हैं?',
      delete_msg: 'यह लिंक स्थायी रूप से हटा दिया जाएगा।',
      delete_btn: 'अभी हटाएं',
      login_req: 'कृपया इंटरैक्ट करने के लिए अपना Pi वॉलेट कनेक्ट करें।',
    }
  },
  es: {
    nav: {
      discover: 'Descubrir',
      connect: 'Conectar',
      admin: 'Moderation',
    },
    home: {
      weekly_best: 'Mejor Semanal',
      hall_of_fame: 'Salón de la Fama',
      fresh_feeds: 'Nuevos Feeds',
      view_all: 'VER TODO',
      load_more: 'Cargar Más',
      no_posts: 'No se encontraron publicaciones',
      no_posts_desc: 'Aún no hay publicaciones en esta categoría.',
      clear_filter: 'Limpiar Filtro',
      cats: {
        all: 'Todo',
        article: 'Artículos',
        other: 'Otro'
      }
    },
    submit: {
      title_new: 'Enviar Enlace',
      title_edit: 'Editar Enlace',
      subtitle: 'Compartir con la comunidad Pi',
      fee: 'Tarifa: 1 Pi',
      link_url: 'URL del Enlace',
      category: 'Categoría',
      post_title: 'Título',
      description: 'Descripción',
      btn_processing: 'Procesando...',
      btn_update: 'Actualizar',
      btn_pay: 'Pagar 1 Pi y Enviar',
      auth_required: 'Autenticación Requerida',
      auth_desc: 'Conecta tu wallet para enviar o editar enlaces.',
      return_home: 'Volver al Inicio',
      ph_title: 'Escribe un título llamativo',
      ph_desc: '¿De qué trata este enlace?',
      warn_imp: 'Importante:',
      warn_text: 'Lee la Política de Envío abajo. Las publicaciones inválidas serán rechazadas sin reembolso.',
      policy_title: 'Política de Envío',
      policy_spam: 'Tarifa Anti-Spam: Se requiere 1 Pi por envío para mantener la calidad y evitar spam.',
      policy_admin: 'Aprobación de Admin: Tu publicación aparecerá después de una revisión manual.',
      policy_content: 'Calidad: Los enlaces deben ser útiles y relevantes para Pi Network. El spam será eliminado.',
      policy_refund: 'SIN REEMBOLSOS: Si se rechaza por violar las normas, no se devolverá el 1 Pi.'
    },
    card: {
      delete_confirm: '¿Estás seguro?',
      delete_msg: 'Este enlace se eliminará permanentemente.',
      delete_btn: 'Eliminar Ahora',
      login_req: 'Conecta tu Pi Wallet para interactuar.',
    }
  },
  vi: {
    nav: {
      discover: 'Khám phá',
      connect: 'Kết nối Ví',
      admin: 'Moderation',
    },
    home: {
      weekly_best: 'Tốt nhất tuần',
      hall_of_fame: 'Bảng vàng',
      fresh_feeds: 'Bảng tin mới',
      view_all: 'XEM TẤT CẢ',
      load_more: 'Tải thêm',
      no_posts: 'Không tìm thấy bài viết',
      no_posts_desc: 'Chưa có bài viết nào trong danh mục này.',
      clear_filter: 'Xóa bộ lọc',
      cats: {
        all: 'Tất cả',
        article: 'Bài viết',
        other: 'Khác'
      }
    },
    submit: {
      title_new: 'Gửi Liên kết',
      title_edit: 'Sửa Liên kết',
      subtitle: 'Chia sẻ với cộng đồng Pi',
      fee: 'Phí: 1 Pi',
      link_url: 'URL Liên kết',
      category: 'Danh mục',
      post_title: 'Tiêu đề',
      description: 'Mô tả',
      btn_processing: 'Đang xử lý...',
      btn_update: 'Cập nhật',
      btn_pay: 'Thanh toán 1 Pi & Gửi',
      auth_required: 'Cần xác thực',
      auth_desc: 'Vui lòng kết nối ví để gửi hoặc sửa liên kết.',
      return_home: 'Về trang chủ',
      ph_title: 'Nhập tiêu đề hấp dẫn',
      ph_desc: 'Liên kết này nói về điều gì?',
      warn_imp: 'Quan trọng:',
      warn_text: 'Đọc Chính sách Gửi bên dưới. Bài viết vi phạm sẽ bị từ chối và không hoàn tiền.',
      policy_title: 'Chính sách Gửi bài',
      policy_spam: 'Phí chống Spam: Cần 1 Pi cho mỗi lần gửi để đảm bảo chất lượng và ngăn chặn spam.',
      policy_admin: 'Duyệt bài: Bài viết của bạn sẽ hiển thị sau khi quản trị viên xét duyệt.',
      policy_content: 'Chất lượng: Liên kết phải hữu ích và liên quan đến Pi Network. Quảng cáo/lừa đảo sẽ bị xóa.',
      policy_refund: 'KHÔNG HOÀN TIỀN: Nếu bị từ chối do vi phạm quy định, phí 1 Pi sẽ KHÔNG được hoàn lại.'
    },
    card: {
      delete_confirm: 'Bạn có chắc chắn không?',
      delete_msg: 'Liên kết này sẽ bị xóa vĩnh viễn.',
      delete_btn: 'Xóa ngay',
      login_req: 'Vui lòng kết nối ví Pi để tương tác.',
    }
  },
  tl: {
    nav: {
      discover: 'Tuklasin',
      connect: 'Ikonekta',
      admin: 'Moderation',
    },
    home: {
      weekly_best: 'Pinakamahusay',
      hall_of_fame: 'Hall of Fame',
      fresh_feeds: 'Bagong Feeds',
      view_all: 'TINGNAN LAHAT',
      load_more: 'Mag-load pa',
      no_posts: 'Walang nakitang post',
      no_posts_desc: 'Wala pang post sa kategoryang ito.',
      clear_filter: 'Alisin ang Filter',
      cats: {
        all: 'Lahat',
        article: 'Artikulo',
        other: 'Iba pa'
      }
    },
    submit: {
      title_new: 'Magpasa ng Link',
      title_edit: 'I-edit ang Link',
      subtitle: 'Ibahagi sa Pi Community',
      fee: 'Bayad: 1 Pi',
      link_url: 'URL ng Link',
      category: 'Kategorya',
      post_title: 'Pamagat',
      description: 'Paglalarawan',
      btn_processing: 'Pinoproseso...',
      btn_update: 'I-update',
      btn_pay: 'Magbayad ng 1 Pi & Ipasa',
      auth_required: 'Kailangan ng Awtentikasyon',
      auth_desc: 'Ikonekta ang wallet upang magpasa o mag-edit.',
      return_home: 'Bumalik sa Home',
      ph_title: 'Maglagay ng magandang pamagat',
      ph_desc: 'Tungkol saan ang link na ito?',
      warn_imp: 'Mahalaga:',
      warn_text: 'Basahin ang Policy sa ibaba. Ang mga maling post ay tatanggihan nang walang refund.',
      policy_title: 'Patakaran sa Pagpasa',
      policy_spam: 'Anti-Spam Fee: May bayad na 1 Pi bawat pasa upang maiwasan ang spam.',
      policy_admin: 'Admin Approval: Ang iyong post ay lalabas lamang pagkatapos ng pagsusuri.',
      policy_content: 'Kalidad: Dapat may kinalaman sa Pi Network at kapaki-pakinabang. Ang scam ay buburahin.',
      policy_refund: 'WALANG REFUND: Kung tinanggihan dahil sa paglabag, ang 1 Pi ay HINDI ibabalik.'
    },
    card: {
      delete_confirm: 'Sigurado ka ba?',
      delete_msg: 'Ang link na ito ay permanenteng tatanggalin.',
      delete_btn: 'Burahin Ngayon',
      login_req: 'Ikonekta ang Pi wallet upang makipag-ugnayan.',
    }
  }
};
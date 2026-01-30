import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { chatAPI } from '../../services/api';
import { getNormalizedImageUrl } from '../../utils/url';
import Loading from '../../components/common/Loading';
import AdminLayout from '../../components/admin/AdminLayout';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

const AdminChat = () => {
    const [conversations, setConversations] = useState([]);
    const [filteredConversations, setFilteredConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [filteredMessages, setFilteredMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [customerSearch, setCustomerSearch] = useState('');
    const [messageSearch, setMessageSearch] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const activeConversationRef = useRef(null);
    const fileInputRef = useRef(null);
    const { user } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Keep ref in sync with state for socket callbacks
    useEffect(() => {
        activeConversationRef.current = activeConversation;
    }, [activeConversation]);

    useEffect(() => {
        fetchConversations();
        setupSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        if (activeConversation) {
            fetchMessages(activeConversation._id);
            markAsRead(activeConversation._id);

            // Join the specific room for the active conversation
            if (socketRef.current) {
                socketRef.current.emit('join_room', activeConversation._id);
            }
        }
    }, [activeConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Filter conversations based on search
    useEffect(() => {
        if (customerSearch.trim()) {
            const filtered = conversations.filter(conv =>
                conv.user?.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
                conv.user?.email?.toLowerCase().includes(customerSearch.toLowerCase())
            );
            setFilteredConversations(filtered);
        } else {
            setFilteredConversations(conversations);
        }
    }, [customerSearch, conversations]);

    // Filter messages based on search
    useEffect(() => {
        if (messageSearch.trim()) {
            const filtered = messages.filter(msg =>
                msg.message.toLowerCase().includes(messageSearch.toLowerCase())
            );
            setFilteredMessages(filtered);
        } else {
            setFilteredMessages(messages);
        }
    }, [messageSearch, messages]);

    const setupSocket = () => {
        socketRef.current = io(SOCKET_URL);

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join_room', 'admin_room');
        });

        socketRef.current.on('new_message', (message) => {
            setMessages(prev => {
                if (activeConversationRef.current && message.conversation === activeConversationRef.current._id) {
                    // Check if message already exists to avoid duplicates
                    if (prev.find(m => m._id === message._id)) return prev;

                    // If this conversation is active, mark new message as read immediately
                    markAsRead(activeConversationRef.current._id);
                    return [...prev, message];
                }
                return prev;
            });

            fetchConversations();
        });

        socketRef.current.on('new_admin_message', (data) => {
            fetchConversations();
        });

        socketRef.current.on('messages_read', (data) => {
            console.log('🔔 [Admin] Received messages_read event:', data);
            // Update message status to 'read' for admin's sent messages
            setMessages(prev => {
                const updated = prev.map(msg =>
                    msg.senderType === 'admin' && msg.status !== 'read'
                        ? { ...msg, status: 'read' }
                        : msg
                );
                console.log('✅ [Admin] Updated messages:', updated.filter(m => m.senderType === 'admin'));
                return updated;
            });
            setFilteredMessages(prev => prev.map(msg =>
                msg.senderType === 'admin' && msg.status !== 'read'
                    ? { ...msg, status: 'read' }
                    : msg
            ));
        });
    };

    const fetchConversations = async () => {
        try {
            const response = await chatAPI.getAdminConversations();
            setConversations(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
            setLoading(false);
        }
    };

    const fetchMessages = async (id) => {
        try {
            const response = await chatAPI.getMessages(id);
            setMessages(response.data);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            console.log('📖 [Admin] Calling markAsRead for conversation:', id);
            const response = await chatAPI.markAsRead(id);
            console.log('✅ [Admin] MarkAsRead response:', response.data);
            setConversations(prev => prev.map(c => c._id === id ? { ...c, unreadCount: 0 } : c));
        } catch (error) {
            console.error('❌ [Admin] Failed to mark as read:', error);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert(t('chat.file_too_large') || 'Kích thước file phải nhỏ hơn 5MB');
            return;
        }

        setSelectedFile(file);

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setFilePreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setFilePreview(null);
        }
    };

    const uploadFile = async () => {
        if (!selectedFile) return null;

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await chatAPI.upload(formData);
            return response.data;
        } catch (error) {
            console.error('Failed to upload file:', error);
            alert(t('chat.upload_failed') || 'Tải file thất bại');
            return null;
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || !activeConversation || sending) return;

        setSending(true);
        try {
            let attachments = [];
            if (selectedFile) {
                const uploaded = await uploadFile();
                if (uploaded) attachments.push(uploaded);
            }

            const response = await chatAPI.sendMessage(activeConversation._id, { message: newMessage, attachments });

            // Add the new message to the messages list immediately
            setMessages(prev => {
                const existing = prev.find(m => m._id === response.data._id);
                if (existing) return prev;
                return [...prev, response.data];
            });

            setNewMessage('');
            setSelectedFile(null);
            setFilePreview(null);
            setUploadProgress(0);
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const getMessageStatusText = (msg) => {
        if (msg.senderType !== 'admin') return null;

        const status = msg.status || 'sent';
        if (status === 'read') {
            return 'Đã xem ✓✓';
        } else {
            return 'Đã gửi ✓';
        }
    };

    if (loading) return <AdminLayout><Loading /></AdminLayout>;

    return (
        <AdminLayout>
            <div className="flex bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden h-[calc(100vh-200px)]">
                {/* Sidebar: Conversation List */}
                <div className="w-80 bg-white border-r border-gray-100 flex flex-col shrink-0">
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xl font-bold text-gray-800">{t('admin_chat.title')}</h2>
                        </div>
                        <input
                            type="text"
                            placeholder={t('admin_chat.search_customers')}
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">
                                {customerSearch ? t('admin_chat.no_results') : t('admin_chat.no_conversations')}
                            </div>
                        ) : (
                            filteredConversations.map((conv) => (
                                <button
                                    key={conv._id}
                                    onClick={() => setActiveConversation(conv)}
                                    className={`w-full text-left p-4 hover:bg-gray-50 transition-all border-b border-gray-50 relative ${activeConversation?._id === conv._id ? 'bg-primary-50/50 border-l-4 border-l-primary-600' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-gray-900 truncate pr-4 text-sm">
                                            {conv.user?.name || 'Unknown Guest'}
                                        </span>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                            {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-gray-500 truncate flex-1">
                                            {conv.lastMessage || t('admin_chat.start_conversation')}
                                        </p>
                                        {conv.unreadCount > 0 && activeConversation?._id !== conv._id && (
                                            <span className="ml-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Area: Active Chat */}
                <div className="flex-1 flex flex-col bg-gray-50/30">
                    {activeConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-sm">
                                        {activeConversation.user?.name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm">{activeConversation.user?.name}</h3>
                                        <p className="text-[10px] text-green-500 font-medium">{activeConversation.user?.email}</p>
                                    </div>
                                </div>
                                <div className="hidden sm:block">
                                    <input
                                        type="text"
                                        placeholder={t('admin_chat.search_messages')}
                                        value={messageSearch}
                                        onChange={(e) => setMessageSearch(e.target.value)}
                                        className="w-48 px-3 py-1.5 text-xs border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
                                    />
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {filteredMessages.map((msg, idx) => (
                                    <div
                                        key={msg._id || idx}
                                        className={`flex flex-col ${msg.senderType === 'admin' ? 'items-end' : 'items-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] shadow-sm ${!msg.message && msg.attachments?.length > 0
                                                ? 'bg-transparent shadow-none'
                                                : `px-4 py-2 rounded-2xl text-sm ${msg.senderType === 'admin'
                                                    ? msg.isAutoReply
                                                        ? 'bg-blue-500 text-white border-2 border-blue-300'
                                                        : 'bg-primary-600 text-white'
                                                    : 'bg-white text-gray-900 border border-gray-100'
                                                }`}`}
                                        >
                                            {msg.isAutoReply && (
                                                <p className="text-[10px] mb-1 opacity-75 italic">{t('admin_chat.auto_reply')}</p>
                                            )}
                                            {msg.message && <p className="leading-relaxed">{msg.message}</p>}

                                            {/* Display attachments */}
                                            {msg.attachments && msg.attachments.length > 0 && (
                                                <div className={`${msg.message ? 'mt-2' : ''} space-y-1`}>
                                                    {msg.attachments.map((file, i) => (
                                                        <div key={i}>
                                                            {file.mimetype?.startsWith('image/') ? (
                                                                <img
                                                                    src={getNormalizedImageUrl(file.url)}
                                                                    alt={file.filename}
                                                                    className="rounded-lg max-w-full cursor-pointer hover:opacity-90 max-h-48 object-cover"
                                                                    onClick={() => window.open(getNormalizedImageUrl(file.url), '_blank')}
                                                                />
                                                            ) : (
                                                                <a
                                                                    href={getNormalizedImageUrl(file.url)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center space-x-2 text-[10px] underline hover:no-underline"
                                                                >
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                                    </svg>
                                                                    <span>{file.filename}</span>
                                                                </a>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Status below message bubble */}
                                        {msg.senderType === 'admin' && (
                                            <div className="text-[10px] text-gray-400 mt-0.5">
                                                {getMessageStatusText(msg)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* File Preview */}
                            {(filePreview || selectedFile) && (
                                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                                    <div className="relative inline-block">
                                        {filePreview ? (
                                            <img src={filePreview} alt="Preview" className="h-16 rounded-xl" />
                                        ) : (
                                            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-xs text-gray-600 truncate max-w-[150px]">{selectedFile?.name}</span>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => {
                                                setSelectedFile(null);
                                                setFilePreview(null);
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md transition-colors"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Input Area */}
                            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
                                <div className="flex items-center space-x-2 max-w-4xl mx-auto">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        accept="image/*,.pdf,.doc,.docx,.zip"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2.5 bg-gray-50 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                                        disabled={sending}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                    </button>
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={t('admin_chat.type_placeholder')}
                                        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                                        disabled={sending}
                                    />
                                    <button
                                        type="submit"
                                        disabled={sending || (!newMessage.trim() && !selectedFile)}
                                        className="bg-primary-600 text-white p-2.5 rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-300 bg-white p-8">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-gray-100">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <p className="text-base font-medium text-gray-500">{t('admin_chat.select_to_start')}</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminChat;

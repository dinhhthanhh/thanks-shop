import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const fileInputRef = useRef(null);
    const isOpenRef = useRef(isOpen);
    const conversationRef = useRef(conversation);
    const { user, isAuthenticated, isAdmin } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Keep refs in sync with state for socket callbacks
    useEffect(() => {
        isOpenRef.current = isOpen;
    }, [isOpen]);

    useEffect(() => {
        conversationRef.current = conversation;
    }, [conversation]);

    useEffect(() => {
        if (isAuthenticated && isOpen) {
            initConversation();
        }
    }, [isAuthenticated, isOpen]);

    useEffect(() => {
        if (isAuthenticated && conversation) {
            socketRef.current = io(SOCKET_URL);

            socketRef.current.on('connect', () => {
                socketRef.current.emit('join_room', conversation._id);
            });

            socketRef.current.on('new_message', (message) => {
                if (isOpenRef.current && conversationRef.current && message.conversation === conversationRef.current._id) {
                    // Mark as read if chat is open
                    markAsRead(conversationRef.current._id);
                }

                setMessages(prev => {
                    const existing = prev.find(m => m._id === message._id);
                    if (existing) return prev;
                    // Update optimistic message if it matches
                    const optimisticIndex = prev.findIndex(m => m.tempId && m.message === message.message);
                    if (optimisticIndex !== -1) {
                        const updated = [...prev];
                        updated[optimisticIndex] = message;
                        return updated;
                    }
                    return [...prev, message];
                });
            });

            socketRef.current.on('messages_read', (data) => {
                console.log('🔔 [Customer] Received messages_read event:', data);
                // Update message status to 'read' for customer's sent messages
                setMessages(prev => {
                    const updated = prev.map(msg =>
                        msg.senderType === 'user' && msg.status !== 'read'
                            ? { ...msg, status: 'read' }
                            : msg
                    );
                    console.log('✅ [Customer] Updated messages:', updated.filter(m => m.senderType === 'user'));
                    return updated;
                });
            });

            return () => {
                if (socketRef.current) {
                    socketRef.current.disconnect();
                }
            };
        }
    }, [isAuthenticated, conversation, user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const initConversation = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/chat/conversation`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConversation(response.data);
            fetchMessages(response.data._id);
            markAsRead(response.data._id); // Mark messages as read when opening chat
        } catch (error) {
            console.error('Failed to init conversation:', error);
        }
    };

    const fetchMessages = async (conversationId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/chat/${conversationId}/messages`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(response.data);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const markAsRead = async (conversationId) => {
        try {
            console.log('📖 [Customer] Calling markAsRead for conversation:', conversationId);
            const token = localStorage.getItem('token');
            const response = await axios.patch(
                `${API_URL}/chat/${conversationId}/read`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('✅ [Customer] MarkAsRead response:', response.data);
        } catch (error) {
            console.error('❌ [Customer] Failed to mark as read:', error);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert(t('chat.file_too_large') || 'File size must be less than 5MB');
            return;
        }

        setSelectedFile(file);

        // Preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result);
            };
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
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/chat/upload`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to upload file:', error);
            const errorMsg = error.response?.data?.message || error.message || 'File upload failed';
            alert(`${t('chat.upload_failed') || 'Upload thất bại'}: ${errorMsg}`);
            return null;
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || !conversation || sending) return;

        setSending(true);

        try {
            let attachments = [];
            if (selectedFile) {
                const uploadedFile = await uploadFile();
                if (uploadedFile) {
                    attachments.push(uploadedFile);
                }
            }

            // Optimistic update - show message immediately
            const tempId = `temp-${Date.now()}`;
            const optimisticMessage = {
                _id: tempId,
                tempId,
                conversation: conversation._id,
                sender: { _id: user._id, name: user.name },
                senderType: 'user',
                message: newMessage,
                status: 'sending',
                attachments,
                createdAt: new Date().toISOString()
            };
            setMessages(prev => [...prev, optimisticMessage]);

            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/chat/${conversation._id}/messages`,
                { message: newMessage, attachments },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update optimistic message with server response
            setMessages(prev => prev.map(m =>
                m.tempId === tempId ? response.data : m
            ));

            setNewMessage('');
            setSelectedFile(null);
            setFilePreview(null);
            setUploadProgress(0);
        } catch (error) {
            console.error('Failed to send message:', error);
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => !m.tempId));
        } finally {
            setSending(false);
        }
    };

    const getMessageStatusText = (msg) => {
        if (msg.senderType !== 'user') return null;

        const status = msg.status || 'sent';
        if (status === 'sending') {
            return 'Đang gửi...';
        } else if (status === 'read') {
            return 'Đã xem ✓✓';
        } else {
            return 'Đã gửi ✓';
        }
    };

    const handleHomeClick = () => {
        setIsOpen(false);
        navigate('/');
    };

    // Hide chat widget for admin users
    if (!isAuthenticated || isAdmin) return null;

    return (
        <>
            {/* Chat Toggle Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-2xl hover:bg-primary-700 transition-all z-50"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="bg-linear-to-r from-primary-600 to-primary-700 text-white p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                <div>
                                    <h3 className="font-bold">{t('chat.support') || 'Customer Support'}</h3>
                                    <p className="text-xs text-primary-100">{t('chat.online') || "We're here to help"}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handleHomeClick}
                                    className="p-1.5 hover:bg-primary-500 rounded-lg transition-colors"
                                    title={t('chat.back_home') || 'Back to home'}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-primary-500 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                            {messages.map((msg, idx) => (
                                <div
                                    key={msg._id || idx}
                                    className={`flex flex-col ${msg.senderType === 'user' ? 'items-end' : 'items-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm cursor-pointer ${msg.senderType === 'user'
                                            ? 'bg-primary-600 text-white'
                                            : msg.isAutoReply
                                                ? 'bg-blue-500 text-white border-2 border-blue-300'
                                                : 'bg-white text-gray-900'
                                            }`}
                                        title={new Date(msg.createdAt).toLocaleString('vi-VN', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    >
                                        {msg.isAutoReply && (
                                            <p className="text-[10px] mb-1 opacity-75 italic">🤖 {t('chat.auto_reply') || 'Auto-reply'}</p>
                                        )}
                                        {msg.message && <p className="text-sm leading-relaxed">{msg.message}</p>}

                                        {/* Display attachments */}
                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="mt-2 space-y-1">
                                                {msg.attachments.map((file, i) => (
                                                    <div key={i}>
                                                        {file.mimetype?.startsWith('image/') ? (
                                                            <img
                                                                src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${file.url}`}
                                                                alt={file.filename}
                                                                className="rounded-lg max-w-full cursor-pointer hover:opacity-90"
                                                                onClick={() => window.open(`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${file.url}`, '_blank')}
                                                            />
                                                        ) : (
                                                            <a
                                                                href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${file.url}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center space-x-2 text-xs underline hover:no-underline"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                    {msg.senderType === 'user' && (
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
                            <div className="px-4 py-2 bg-gray-100 border-t border-gray-200">
                                <div className="relative inline-block">
                                    {filePreview ? (
                                        <img src={filePreview} alt="Preview" className="h-20 rounded-lg" />
                                    ) : (
                                        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg">
                                            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-sm text-gray-700">{selectedFile?.name}</span>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => {
                                            setSelectedFile(null);
                                            setFilePreview(null);
                                            setUploadProgress(0);
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                {uploadProgress > 0 && uploadProgress < 100 && (
                                    <div className="mt-2 bg-gray-300 rounded-full h-2">
                                        <div className="bg-primary-600 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Input */}
                        <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-200">
                            <div className="flex items-end space-x-2">
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
                                    className="p-2 bg-primary-100 text-primary-600 hover:text-primary-700 hover:bg-primary-200 rounded-lg transition-colors shrink-0 border border-primary-300"
                                    disabled={sending}
                                    title={t('chat.attach_file') || 'Đính kèm file'}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={t('chat.type_message') || 'Type a message...'}
                                    className="flex-1 px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                    disabled={sending}
                                />
                                <button
                                    type="submit"
                                    disabled={sending || (!newMessage.trim() && !selectedFile)}
                                    className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatWidget;

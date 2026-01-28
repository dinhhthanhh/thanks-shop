import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    activeTheme: {
        type: String,
        enum: ['default', 'tet', 'christmas', 'valentine', 'april-30'],
        default: 'default'
    },
    siteName: {
        type: String,
        default: 'Thanks-Shop'
    },
    autoReplyEnabled: {
        type: Boolean,
        default: true
    },
    autoReplyMessage: {
        type: String,
        default: 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất. / Thank you for reaching out! We will respond as soon as possible.'
    }
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;

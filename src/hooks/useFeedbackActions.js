import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import emailjs from 'emailjs-com';
import { toast } from 'react-toastify';

export const useFeedbackActions = (user) => {
    const [uploading, setUploading] = useState(false);

    const sendFeedback = async (data, imageFile) => {
        setUploading(true);
        try {
            let imageUrl = "";

            // 1. Resim Yükleme (Eğer seçildiyse)
            if (imageFile) {
                const storageRef = ref(storage, `feedback_images/${Date.now()}_${imageFile.name}`);
                const snapshot = await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(snapshot.ref);
            }

            // 2. Firestore Kayıt
            const feedbackData = {
                uid: user?.uid || "anonymous",
                userEmail: user?.email || "anonymous@user.com",
                type: data.type,
                message: data.message,
                imageUrl: imageUrl,
                createdAt: new Date(),
                status: 'new'
            };

            await addDoc(collection(db, "feedbacks"), feedbackData);

            // 3. EmailJS Gönderimi (Placeholder IDs)
            // NOT: Kullanıcı kendi ID'lerini .env üzerinden veya direkt buraya girmelidir.
            // Şimdilik hata vermemesi için try-catch içinde ve dummy ID'ler.
            try {
                const serviceID = "YOUR_SERVICE_ID"; // E.g., 'service_xyz'
                const templateID = "YOUR_TEMPLATE_ID"; // E.g., 'template_abc'
                const userID = "YOUR_USER_ID"; // E.g., 'user_123' (Public Key)

                if (serviceID !== "YOUR_SERVICE_ID") {
                    const templateParams = {
                        from_name: user?.email || "Kullanıcı",
                        type: data.type,
                        message: data.message,
                        image_link: imageUrl ? imageUrl : "Resim Yok"
                    };
                    await emailjs.send(serviceID, templateID, templateParams, userID);
                } else {
                    console.log("EmailJS ID'leri girilmediği için mail atlanıyor.");
                }
            } catch (emailError) {
                console.warn("Email gönderilemedi:", emailError);
                // Email hatası kritik değil, veritabanına kaydoldu, devam et.
            }

            toast.success("Notunuz başarıyla geliştiriciye iletildi!");
            setUploading(false);
            return true;

        } catch (error) {
            console.error("Geri bildirim hatası:", error);
            toast.error("Bir hata oluştu, lütfen tekrar deneyin.");
            setUploading(false);
            return false;
        }
    };

    return {
        sendFeedback,
        uploading
    };
};

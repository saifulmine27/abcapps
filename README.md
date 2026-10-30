# টাকাগুছি

বাংলা ও ইংরেজি দৈনন্দিন আয়-খরচের ওয়েব অ্যাপ। মাসভিত্তিক আয়, খরচ ও হাতে থাকা ব্যালান্স দেখায়; লেনদেন যোগ, সম্পাদনা, মুছুন ও সার্চ করা যায়।

খরচের জন্য ৩০টি preset বিভাগ ও রঙিন category icon আছে। নিচের “গ্রাফ” ট্যাবে মাস বা বছর বেছে আয়/খরচের donut graph, বিভাগভিত্তিক শতাংশ এবং শীর্ষ বিভাগ দেখা যায়।

## ব্যবহার

`index.html` browser-এ খুলুন। ইনস্টলযোগ্য PWA ও অফলাইন ক্যাশের জন্য ওয়েব সার্ভারে পুরো ফোল্ডারটি প্রকাশ করুন।

## Google sign-in ও sync চালু করা

অ্যাপটিতে Google sign-in এবং Firebase Cloud Firestore sync-এর UI ও কোড আছে। চালু করতে Firebase project configuration লাগবে:

1. Firebase Console-এ project তৈরি করে একটি Web app register করুন।
2. Authentication-এ Google sign-in provider চালু করুন এবং আপনার hosting domain অনুমোদিত domain-এ যোগ করুন।
3. Cloud Firestore database তৈরি করুন। Firestore Rules-এ `firestore.rules` ফাইলের নিয়ম publish করুন—এগুলো প্রতিটি account-কে শুধু নিজের data-তে access দেয়।
4. Firebase Web app-এর config values `firebase-config.js`-এ বসান। এখানে service-account key দেবেন না।
5. পুরো project folder HTTPS hosting-এ publish করুন। Preview-এর `localhost` স্থানীয় sign-in-এর জন্য ব্যবহার করা যায়।

Firebase setup না করা পর্যন্ত হিসাব শুধু এই device-এর browser storage-এ থাকবে। Google দিয়ে sign-in করলে local হিসাব cloud-এর সঙ্গে merge হবে; পরের device-এ একই Google account দিয়ে sign-in করলে sync হবে।

// Replace the placeholders below with the actual Firebase config values from your Firebase project settings
// https://console.firebase.google.com
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",                 // Your Firebase API key. Found in Firebase Console: Project Settings > General > Your apps > Web app > apiKey

    authDomain: "YOUR_AUTH_DOMAIN",         // Your Firebase auth domain. Found in Firebase Console: Project Settings > General > Your apps > Web app > authDomain

    projectId: "YOUR_PROJECT_ID",           // Your Firebase project ID. Found in Firebase Console: Project Settings > General > Your apps > Web app > projectId

    storageBucket: "YOUR_STORAGE_BUCKET",   // Your Firebase storage bucket. Found in Firebase Console: Project Settings > General > Your apps > Web app > storageBucket

    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",   // Your Firebase messaging sender ID. Found in Firebase Console: Project Settings > General > Your apps > Web app > messagingSenderId

    appId: "YOUR_APP_ID"                    // Your Firebase app ID. Found in Firebase Console: Project Settings > General > Your apps > Web app > appId
};

// IMPORTANT: For enhanced security, consider encrypting your Firebase configuration using a tool like https://obfuscator.io before deploying your application.

// By encrypting your Firebase config, you can help protect sensitive information such as API keys, project IDs, and app IDs from being exposed in your client-side code.

// Steps to encrypt your Firebase config:
// 1. Copy your Firebase config object from your project settings.
// 2. Paste the config object into https://obfuscator.io and choose appropriate settings for encryption.
// 3. Generate the encrypted code and replace the original Firebase config in your code with the encrypted version.
// 4. Ensure that your application can still decrypt and use the encrypted Firebase config during runtime.


firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();
const firestore = firebase.firestore();

const FILE_INPUT_SELECTOR = '#fileInput';
const FILE_LIST_SELECTOR = '#fileList';
const UPLOAD_BTN_CLASS = '.upload-btn';

// Update the PATH constant to specify the desired location in Firebase Cloud Storage
const PATH = "files";
// This constant represents the path within Firebase Cloud Storage where your files will be stored.
// You can change this to any valid path within your Firebase Storage bucket.
// Suggestion: Keep the path the same

const storageRef = storage.ref(`${PATH}/`);

async function uploadFile() {
    const fileInput = document.querySelector(FILE_INPUT_SELECTOR);
    const file = fileInput.files[0];
    if (!file) {
        console.log('No file selected');
        return;
    }
      try {
          const fileList = await storageRef.listAll();
          const filesCount = fileList.items.length;
          const fileExtension = file.name.split('.').pop();
          const newFileName = `CF${filesCount + 1 < 10 ? '0' : ''}${filesCount + 1}.${fileExtension}`;
          const newFileRef = storageRef.child(newFileName);

          console.log('Uploading file with name:', newFileName);
          await newFileRef.put(file);
          console.log('File Uploaded successfully as:', newFileName);
          fileInput.value = '';
          listFiles();
      } catch (error) {
          console.error('Error in uploadFile:', error);
      }
    
}

function listFiles() {
    const fileListElement = document.querySelector(FILE_LIST_SELECTOR);
    fileListElement.innerHTML = '';

    storageRef.listAll().then(result => {
        const filesMetadata = [];
        let filesProcessed = 0;

        result.items.forEach(fileRef => {
            fileRef.getDownloadURL().then(url => {
                fileRef.getMetadata().then(metadata => {
                    filesMetadata.push({ url, name: fileRef.name, date: metadata.timeCreated });

                    filesProcessed++;
                    if (filesProcessed === result.items.length) {
                        displaySortedFiles(filesMetadata, fileListElement);
                    }
                }).catch(error => {
                    console.error('Error fetching metadata:', error);
                    filesProcessed++;
                });
            });
        });
    });
}

function displaySortedFiles(filesMetadata, fileListElement) {
    filesMetadata.sort((a, b) => new Date(b.date) - new Date(a.date));

    filesMetadata.forEach(({ url, name, date }) => {
        const formattedDate = new Date(date).toISOString().split('T')[0];
        fileListElement.innerHTML += `
            <div>
                <p><strong>${formattedDate}</strong> - ${name}</p>
                <div class="buttons">
                    <a href="javascript:void(0)" onclick="downloadFile('${url}', '${name}')" class="download-btn">Download</a>
                    <button class="file-delete-btn" onclick="deleteFile('${name}')">Delete</button>
                </div>
            </div>
            <hr>
        `;
    });

    updateElementDisplay();
}

function downloadFile(url, fileName) {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || 'download';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 100);
}

function deleteFile(fileName) {
    storage.ref(`${PATH}/${fileName}`).delete().then(() => {
      console.log('File Deleted');
      listFiles();
    });
}

window.onload = listFiles;

document.addEventListener('contextmenu', event => {
  event.preventDefault();
});

document.onkeydown = function (e) {
  return false;
}


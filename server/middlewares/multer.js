import multer from 'multer'
import os from 'os'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, os.tmpdir())
    },
    filename: function (req, file, cb) {
        const filename = Date.now() + "-" + file.originalname
        cb(null, filename)
    }
})

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }
})
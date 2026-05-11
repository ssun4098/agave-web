import { useRef, useState } from "react"
import useAuthStore from "../../store/auth"
import Button from "../../components/ui/Button"
import { AccountService } from "../../services/account"

function MyPage() {
    const { user } = useAuthStore()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [inputs, setInputs] = useState<{ name: string; avatar: File | null }>({
        name: user?.name ?? '',
        avatar: null,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target

    if (name === "avatar" && files?.[0]) {
        const file = files[0]

        setInputs(prev => ({
            ...prev,
            avatar: file
        }))

        setPreviewUrl(URL.createObjectURL(file))
        return
    }

    setInputs(prev => ({
        ...prev,
        [name]: value
    }))
    }
    const handleSubmit = async (e: React.MouseEventHandler<HTMLButtonElement>) => {
        const {name, avatar} = inputs;
        if(!name) {
            alert('이름을 작성해주세요.')
            return
        }

        if(name.length > 20) {
            alert('이름은 최대 20자까지 허용합니다.')
            return
        }
        try {
            await AccountService.updateMe({ name, avatar: avatar ?? undefined });
            alert('수정되었습니다.')
        } catch (err) {
            alert('에러 발생')
            console.log(err)
        }
    }

    return <>
    <div className="space-y-8">
              {/* Profile Card */}
              <div
                className="bg-surface-container-lowest rounded-3xl p-8 lg:p-12 shadow-[0_20px_50px_rgba(43,56,150,0.05)] border border-outline-variant/20"
              >
                <div className="space-y-8">
                  <div className="flex items-center gap-8">
                    <div className="relative group shrink-0">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-outline-variant shadow-lg">
                        <img
                          alt="Current user avatar"
                          className="w-full h-full object-cover"
                          src={previewUrl ?? user?.avatarLink}
                        />
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        name="avatar"
                        onChange={handleChange}
                      />
                      <button
                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary text-on-primary rounded-xl flex items-center justify-center shadow-lg hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <span className="material-symbols-outlined text-base">photo_camera</span>
                      </button>
                    </div>
                    <div className="flex-1 space-y-4">
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-1">이름</label>
                      <div className="relative group">
                        <input
                          className="w-full px-5 py-3.5 bg-surface-container-low border-2 border-transparent focus:border-primary focus:ring-0 rounded-2xl font-medium transition-all text-on-surface"
                          placeholder="Your name"
                          type="text"
                          name="name"
                          value={inputs.name}
                          onChange={handleChange}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors">
                          <span className="material-symbols-outlined text-base">edit</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="h-px w-full bg-outline-variant/20"></div>
                  <div className="flex justify-end gap-3">
                    <Button variant="primary" onClick={handleSubmit}>Save</Button>
                  </div>
                </div>
              </div>
            </div>
    </>
}

export default MyPage
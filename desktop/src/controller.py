# --- controller.py ---
import time
import win32gui
import win32process
import win32api
import win32con
from pywinauto.application import Application


class MusicAppController:
    KEY_COMMANDS = {
        "spotify": {
            "play_pause": "{SPACE}",
            "next_track": "^{RIGHT}",
            "prev_track": "^{LEFT}",
            "skip_forward": "+{RIGHT}",
            "skip_backward": "+{LEFT}",
        },
        "tidal": {
            "play_pause": "{SPACE}",
            "next_track": "^{RIGHT}",
            "prev_track": "^{LEFT}",
            "skip_forward": "^+{RIGHT}",
            "skip_backward": "^+{LEFT}",
        },
        "apple music": {
            "play_pause": "{SPACE}",
            "next_track": "^{RIGHT}",
            "prev_track": "^{LEFT}",
            "skip_forward": "^+{RIGHT}",
            "skip_backward": "^+{LEFT}",
        },
    }

    def __init__(self, app_name="Spotify"):
        self.app_name = app_name.lower()
        if self.app_name not in self.KEY_COMMANDS:
            raise ValueError(f"App '{app_name}' not supported")

    def is_running(self):
        """Kiểm tra nhanh xem process có đang chạy không"""
        return self._get_pid_by_name() is not None

    def _get_pid_by_name(self):
        found_pid = None
        target_name = self.app_name

        def callback(hwnd, extra):
            nonlocal found_pid
            if found_pid:
                return
            if not win32gui.IsWindowVisible(hwnd):
                return
            try:
                _, pid = win32process.GetWindowThreadProcessId(hwnd)
                h_process = win32api.OpenProcess(
                    win32con.PROCESS_QUERY_INFORMATION | win32con.PROCESS_VM_READ,
                    False,
                    pid,
                )
                try:
                    exe_path = win32process.GetModuleFileNameEx(h_process, 0)
                except:
                    exe_path = ""
                finally:
                    win32api.CloseHandle(h_process)

                if target_name in exe_path.lower():
                    # Check thêm title để chắc chắn đó là cửa sổ chính
                    if win32gui.GetWindowText(hwnd):
                        found_pid = pid
            except Exception:
                pass

        win32gui.EnumWindows(callback, None)
        return found_pid

    def _send_keys_pywinauto(self, command_name):
        keys_string = self.KEY_COMMANDS[self.app_name].get(command_name)
        if not keys_string:
            return False, "Command mapping not found"

        pid = self._get_pid_by_name()
        if not pid:
            return False, f"{self.app_name} is not running"

        original_hwnd = win32gui.GetForegroundWindow()

        try:
            app = Application(backend="win32").connect(process=pid)
            dlg = app.top_window()

            if dlg.get_show_state() == win32con.SW_SHOWMINIMIZED:
                dlg.restore()

            dlg.set_focus()
            dlg.type_keys(keys_string, pause=0.05)

            if original_hwnd and original_hwnd != dlg.handle:
                try:
                    time.sleep(0.05)
                    win32gui.SetForegroundWindow(original_hwnd)
                except Exception:
                    # Fallback nếu không set được focus
                    win32api.keybd_event(win32con.VK_MENU, 0, 0, 0)
                    win32api.keybd_event(
                        win32con.VK_MENU, 0, win32con.KEYEVENTF_KEYUP, 0
                    )
                    try:
                        win32gui.SetForegroundWindow(original_hwnd)
                    except:
                        pass

            return True, "Executed"

        except Exception as e:
            return False, str(e)

    def play_pause(self):
        return self._send_keys_pywinauto("play_pause")

    def next_track(self):
        return self._send_keys_pywinauto("next_track")

    def prev_track(self):
        return self._send_keys_pywinauto("prev_track")

    def skip_forward(self):
        return self._send_keys_pywinauto("skip_forward")

    def skip_backward(self):
        return self._send_keys_pywinauto("skip_backward")

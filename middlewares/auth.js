import passport from "passport";
import { StatusCodes } from "http-status-codes";
import jsonwebtoken from "jsonwebtoken";

// 登入驗證
export const login = (req, res, next) => {
	// 驗證 login
	// 不使用 session（即不會在伺服器端儲存使用者的登入狀態）
	passport.authenticate("login", { session: false }, (error, user, info) => {
		if (!user || error) {
			if (info.message === "Missing credentials") {
				res.status(StatusCodes.BAD_REQUEST).json({
					success: false,
					message: "輸入欄位錯誤"
				});
				return;
			} else if (info.message === "未知錯誤") {
				res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
					success: false,
					message: "未知錯誤"
				});
				return;
			} else {
				res.status(StatusCodes.BAD_REQUEST).json({
					success: false,
					message: info.message
				});
				return;
			}
		}
		// 認證成功，賦值
		req.user = user;
		next();
	})(req, res, next);
};

export const jwt = (req, res, next) => {
	// 驗證 jwt
	passport.authenticate("jwt", { session: false }, (error, data, info) => {
		if (error || !data) {
			// 驗證實例
			if (info instanceof jsonwebtoken.JsonWebTokenError) {
				res.status(StatusCodes.UNAUTHORIZED).json({
					success: false,
					message: "登入無效"
				});
			} else if (info.message === "未知錯誤") {
				res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
					success: false,
					message: "jwt未知錯誤"
				});
			} else {
				res.status(StatusCodes.UNAUTHORIZED).json({
					success: false,
					message: info.message
				});
			}
			return;
		}
		// 認證成功，賦值
		req.user = data.user;
		req.token = data.token;
		next();
	})(req, res, next);
};

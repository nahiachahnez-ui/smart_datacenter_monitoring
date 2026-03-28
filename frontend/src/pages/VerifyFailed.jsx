function VerifyFailed(){

return(

<div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">

<div className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow text-center">

<h1 className="text-3xl font-bold text-red-500 mb-4">
Verification Failed ❌
</h1>

<p className="text-gray-600 dark:text-gray-300 mb-6">
The verification link is invalid or expired.
</p>

<a
href="/"
className="bg-red-500 text-white px-6 py-3 rounded"
>

Back to Login

</a>

</div>

</div>

)

}

export default VerifyFailed;
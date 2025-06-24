import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Coins, Upload, Sparkles, Zap, Trophy, ImageIcon, CheckCircle } from "lucide-react"
import { createRemixerCoin, createSplit, createSplitsClient, uploadFileToIPFS, uploadJsonToIPFS, handleError, handleSuccess } from "../scripts/actions"
// import { createCoin, DeployCurrency, validateMetadataJSON } from "@zoralabs/coins-sdk";
import { usePublicClient, useWalletClient } from "wagmi"
import { type Address } from "viem";

const RemixerAddress = import.meta.env.VITE_REMIXER_CONTRACT!;

export default function CreateMemePage() {
  const [formData, setFormData] = useState({
    memeName: "",
    tokenSymbol: "",
    description: "",
    payoutRecipient: "",
    revenueShare: "",
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [image, setImage] = useState<File>()
  const [currentStep, setCurrentStep] = useState(1)
  // const [coinMetadataUri, setCoinMetadataUri] = useState("");

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Update progress based on filled fields
    const filledFields = Object.values({ ...formData, [field]: value }).filter((val) => val.trim() !== "").length
    const totalFields = 3
    const imageUploaded = imagePreview ? 1 : 0
    const progress = Math.ceil(((filledFields + imageUploaded) / 4) * 3)
    setCurrentStep(Math.max(1, progress))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImage(file);
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
        // Update progress when image is uploaded
        const filledFields = Object.values(formData).filter((val) => val.trim() !== "").length
        const progress = Math.ceil(((filledFields + 1) / 4) * 3)
        setCurrentStep(Math.max(1, progress))
      }
      reader.readAsDataURL(file)
    }
  }

  const steps = [
    { icon: Sparkles, label: "Basic Info", completed: currentStep > 1 },
    { icon: ImageIcon, label: "Upload Image", completed: currentStep > 2 },
    { icon: Trophy, label: "Ready to Mint", completed: currentStep >= 3 },
  ]

  async function handleUploadFile(file: File, maxSizeMb: number) {
    if (file.size > maxSizeMb * 1024 * 1024) throw new Error(`File size exceeds ${maxSizeMb}MB limit`);

    const cid = await uploadFileToIPFS(file, file.name);
    return cid;
  }

  async function handleUploadMetadata(metadata: any, filename: string) {
    const data = JSON.stringify(metadata);
    const cid = await uploadJsonToIPFS(data, filename);
    return cid;
  }

  async function uploadCoinMetadata() {
    try {
      const name = formData.memeName.trim();
      const description = formData.description.trim();

      if (!name || !description || !image) throw new Error("Invalid inputs");
      const imageCid = await handleUploadFile(image, 10);
      if (!imageCid) throw new Error("Coin image upload failed");

      const metadata = {
        name,
        image: `ipfs://${imageCid}`,
        description,
      }
      console.log("Image url:", `https://ipfs.io/ipfs/${imageCid}`);

      validateMetadataJSON(metadata);
      const metadataCid = await handleUploadMetadata(metadata, `ZoraCoinMetadata_${name.toLowerCase().replace(/\s+/g, "-")}.json`);  // Replace spaces with hyphens in filename
      // if (!metadataCid) throw new Error("Coin metadata upload failed");
      const metadataUri = `ipfs://${metadataCid}`;
      console.log("Metadata url:", `https://ipfs.io/ipfs/${metadataCid}`);

      // setCoinMetadataUri(metadataUri)
      return metadataUri;
    } catch (error) {
      handleError(error);
      console.error(error.message);
    }
  }

  // async function createSplitsContract(payoutRecipient: Address, revenueShare: number) {
  //   const splitsClient = createSplitsClient(publicClient!.chain.id, publicClient!, walletClient!);
  //   const response = await createSplit(
  //     [],
  //     [],
  //     RemixerAddress,
  //     RemixerAddress,
  //     publicClient!.chain.id,
  //     splitsClient
  //   );

  //   console.log("Splits contract created:", response);
  //   return response.splitAddress;
  // }

  // async function handleCreateCoin(coinMetadataUri: string) {
  //   try {
  //     const name = formData.memeName.trim();
  //     const symbol = formData.tokenSymbol.trim().toUpperCase();
  //     const coinPayoutRecipient = formData.payoutRecipient as Address;
  //     const revenueShare = Number(formData.revenueShare ?? "0");
  //     const creators = ['0xE09b13f723f586bc2D98aa4B0F2C27A0320D20AB'] as Address[];

  //     if (!name || !symbol || !coinMetadataUri || !coinPayoutRecipient || revenueShare < 0) throw new Error("Invalid inputs");

  //     // const splitsAddress = await createSplitsContract(payoutRecipient, revenueShare);
  //     const coinArgs = {
  //       name,             // The name of the coin (e.g., "My Awesome Coin")
  //       symbol,           // The trading symbol for the coin (e.g., "MAC")
  //       uri: coinMetadataUri,              // Metadata URI (an IPFS URI is recommended)
  //       chainId: publicClient!.chain.id,         // The chain ID (defaults to base mainnet)
  //       owners: [RemixerAddress],       // Optional array of owner addresses, defaults to [payoutRecipient]
  //       payoutRecipient: coinPayoutRecipient, // Address that receives creator earnings
  //       platformReferrer: RemixerAddress, // Optional platform referrer address, earns referral fees
  //       // DeployCurrency.ETH or DeployCurrency.ZORA
  //       currency: DeployCurrency.ETH, // Optional currency for trading (ETH or ZORA)
  //     }
  //     const result = await createCoin(coinArgs, walletClient!, publicClient!);
  //     if (!result.address) throw new Error("Coin creation failed");
  //     console.log("Coin address:", result.address);

  //     // Todo: payout can be gotten through contract
  //     const txHash = await addRemixerCoin(result.address, coinPayoutRecipient, revenueShare, creators, walletClient!);
  //     publicClient?.waitForTransactionReceipt({ hash: txHash }).then((txReceipt) => {
  //       if (txReceipt.status === "reverted") throw new Error("New remixer coin addition reverted");
  //       else {
  //         console.log("New coin added successfully!");
  //       }
  //     });
  //   } catch (error) {
  //     console.error("Error creating coin:", error);
  //   }
  // }

  async function handleSubmit() {
    if (!walletClient) {
      handleError(new Error("Wallet not connected"));
      return;
    }

    try {
      const metadataUri = await uploadCoinMetadata();
      if (!metadataUri) throw new Error("Coin metadata upload failed");

      const name = formData.memeName.trim();
      const symbol = formData.tokenSymbol.trim().toUpperCase();
      const coinPayoutRecipient = formData.payoutRecipient as Address;
      const revenueShare = Number(formData.revenueShare ?? "0");
      const creators = ['0xE09b13f723f586bc2D98aa4B0F2C27A0320D20AB'] as Address[];

      if (!name || !symbol || !coinMetadataUri || !coinPayoutRecipient || revenueShare < 0) throw new Error("Invalid inputs");


      const txHash = await createRemixerCoin(
        coinPayoutRecipient,
        ["0xE09b13f723f586bc2D98aa4B0F2C27A0320D20AB"],
        metadataUri,
        name,
        symbol,
        revenueShare,
        "dont know a salt",
        walletClient
      );

      publicClient?.waitForTransactionReceipt({ hash: txHash }).then((txReceipt) => {
        if (txReceipt.status === "reverted") handleError(new Error("New remixer coin addition reverted"));
        else {
          handleSuccess("New coin added successfully!");
          setFormData({
            memeName: "",
            tokenSymbol: "",
            description: "",
          });
          setImagePreview(null);
          setImage(undefined);
          setCurrentStep(1);
        }
      });

    } catch (error) {
      handleError(error);
    }
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Coins className="w-8 h-8 text-indigo-500" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Create Your Meme Coin</h1>
            <Zap className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Turn your meme into the next big crypto sensation! Fill out the form below and watch your creation come to
            life.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 border-2 border-indigo-100 shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  Progress
                </h3>
                <div className="space-y-4">
                  {steps.map((step, index) => {
                    const StepIcon = step.icon
                    const isActive = currentStep === index + 1
                    const isCompleted = step.completed

                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${isActive
                          ? "bg-indigo-50 border-2 border-indigo-200"
                          : isCompleted
                            ? "bg-green-50 border-2 border-green-200"
                            : "bg-gray-50 border-2 border-gray-100"
                          }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${isActive
                            ? "bg-indigo-500 text-white"
                            : isCompleted
                              ? "bg-green-500 text-white"
                              : "bg-gray-300 text-gray-600"
                            }`}
                        >
                          {isCompleted ? <CheckCircle className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                        </div>
                        <span
                          className={`text-sm font-medium ${isActive || isCompleted ? "text-gray-900" : "text-gray-500"
                            }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-gray-100 shadow-xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Meme Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      Meme Name
                    </label>
                    <Card className="border-2 border-gray-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-md">
                      <CardContent className="p-0">
                        <Input
                          placeholder="Enter your epic meme name..."
                          value={formData.memeName}
                          onChange={(e) => handleInputChange("memeName", e.target.value)}
                          className="border-0 text-lg p-4 focus:ring-0 focus:outline-none"
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Token Symbol */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Coins className="w-4 h-4 text-yellow-400" />
                      Token Symbol
                    </label>
                    <Card className="border-2 border-gray-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-md">
                      <CardContent className="p-0">
                        <Input
                          placeholder="e.g., DOGE, PEPE, MOON"
                          value={formData.tokenSymbol}
                          onChange={(e) => handleInputChange("tokenSymbol", e.target.value.toUpperCase())}
                          className="border-0 text-lg p-4 focus:ring-0 focus:outline-none uppercase"
                          maxLength={6}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Payout Recipient */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Coins className="w-4 h-4 text-yellow-400" />
                      Payout Recipient
                    </label>
                    <Card className="border-2 border-gray-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-md">
                      <CardContent className="p-0">
                        <Input
                          placeholder="0xAddress..."
                          value={formData.payoutRecipient}
                          onChange={(e) => handleInputChange("payoutRecipient", e.target.value)}
                          className="border-0 text-lg p-4 focus:ring-0 focus:outline-none"
                          maxLength={42}
                          minLength={42}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Revenue Share */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Coins className="w-4 h-4 text-yellow-400" />
                      Revenue Share (%)
                    </label>
                    <Card className="border-2 border-gray-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-md">
                      <CardContent className="p-0">
                        <Input
                          placeholder="0-100"
                          type="number"
                          value={formData.revenueShare}
                          onChange={(e) => handleInputChange("revenueShare", e.target.value)}
                          className="border-0 text-lg p-4 focus:ring-0 focus:outline-none"
                          min={0}
                          max={100}
                          step="any"
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      Description
                    </label>
                    <Card className="border-2 border-gray-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-md">
                      <CardContent className="p-0">
                        <Textarea
                          placeholder="Tell the world about your meme coin! What makes it special?"
                          value={formData.description}
                          onChange={(e) => handleInputChange("description", e.target.value)}
                          className="border-0 text-lg p-4 focus:ring-0 focus:outline-none min-h-[120px] resize-none"
                          maxLength={280}
                        />
                      </CardContent>
                    </Card>
                    <div className="text-right text-sm text-gray-500">{formData.description.length}/280</div>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-indigo-500" />
                      Upload Meme Image
                    </label>
                    <Card className="border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-all duration-300 hover:shadow-md">
                      <CardContent className="p-8">
                        <div className="text-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-upload"
                          />
                          <label
                            htmlFor="image-upload"
                            className="cursor-pointer flex flex-col items-center gap-4 hover:scale-105 transition-transform duration-300"
                          >
                            <div className="p-4 bg-indigo-100 rounded-full">
                              <Upload className="w-8 h-8 text-indigo-500" />
                            </div>
                            <div>
                              <p className="text-lg font-medium text-gray-900">Click to upload your meme</p>
                              <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                            </div>
                          </label>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmit}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-indigo-300 hover:cursor-pointer"
                    style={{
                      boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)",
                    }}
                  >
                    <Sparkles className="w-6 h-6 mr-2" />
                    Mint Your Meme Coin
                    <Zap className="w-6 h-6 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 border-2 border-yellow-200 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Meme Preview
                </h3>

                <div className="space-y-4">
                  {/* Image Preview */}
                  <div className="aspect-square bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Meme preview"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm">Your meme will appear here</p>
                      </div>
                    )}
                  </div>

                  {/* Text Preview */}
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded-xl border-2 border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Name</p>
                      <p className="font-bold text-gray-900">{formData.memeName || "Your Meme Name"}</p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border-2 border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Symbol</p>
                      <p className="font-bold text-indigo-600">${formData.tokenSymbol || "SYMBOL"}</p>
                    </div>

                    {formData.description && (
                      <div className="p-3 bg-white rounded-xl border-2 border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Description</p>
                        <p className="text-sm text-gray-700 line-clamp-3">{formData.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

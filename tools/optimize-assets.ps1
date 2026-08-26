Add-Type -AssemblyName System.Drawing

function Save-Jpeg {
  param([string]$Source, [string]$Destination, [long]$Quality = 92)
  $image = [System.Drawing.Image]::FromFile((Resolve-Path -LiteralPath $Source))
  try {
    $bitmap = [System.Drawing.Bitmap]::new($image.Width, $image.Height, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      try {
        $graphics.Clear([System.Drawing.Color]::White)
        $graphics.DrawImage($image, 0, 0, $image.Width, $image.Height)
      } finally { $graphics.Dispose() }
      $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
      $parameters = New-Object System.Drawing.Imaging.EncoderParameters 1
      $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), $Quality
      $bitmap.Save((Join-Path (Get-Location) $Destination), $encoder, $parameters)
      $parameters.Dispose()
    } finally { $bitmap.Dispose() }
  } finally { $image.Dispose() }
}

function Save-ResizedPng {
  param([string]$Source, [string]$Destination, [int]$Maximum = 600)
  $image = [System.Drawing.Image]::FromFile((Resolve-Path -LiteralPath $Source))
  try {
    $scale = [Math]::Min([double]1.0, [double]$Maximum / [double][Math]::Max($image.Width, $image.Height))
    $width = [Math]::Max(1, [int][Math]::Round($image.Width * $scale))
    $height = [Math]::Max(1, [int][Math]::Round($image.Height * $scale))
    $bitmap = [System.Drawing.Bitmap]::new($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      $bitmap.SetResolution(96, 96)
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      try {
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.DrawImage($image, 0, 0, $width, $height)
      } finally { $graphics.Dispose() }
      $bitmap.Save((Join-Path (Get-Location) $Destination), [System.Drawing.Imaging.ImageFormat]::Png)
    } finally { $bitmap.Dispose() }
  } finally { $image.Dispose() }
}

$backgrounds = @(
  'page-03-background',
  'page-04-background',
  'page-05-background-clean-v2',
  'page-06-background-clean'
)
foreach ($name in $backgrounds) {
  Save-Jpeg "assets/images/week-1/literacy/$name.png" "assets/images/week-1/literacy/$name-optimized.jpg"
}

$parts = @('abdomen', 'antennae', 'stinger', 'wings')
foreach ($part in $parts) {
  Save-ResizedPng "assets/images/week-1/literacy/page-05-part-$part-v2.png" "assets/images/week-1/literacy/page-05-part-$part-optimized.png"
}

$lessonIcons = @(
  'lesson-games-wanda',
  'lesson-literacy-gerry',
  'lesson-phonics-coover',
  'lesson-reading-penny'
)
foreach ($name in $lessonIcons) {
  Save-ResizedPng "assets/images/ui/week-home/$name.png" "assets/images/ui/week-home/$name-optimized.png"
}
